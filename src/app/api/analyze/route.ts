import { z } from "zod";
import {
  AnalysisProviderUnavailableError,
  analysisProvider,
} from "@/lib/analysis/provider";
import {
  loadDemoRepository,
  prepareRepository,
} from "@/lib/analysis/repository";
import { AnalyzeRequestSchema } from "@/lib/analysis/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_REQUEST_BYTES = 750_000;
const WINDOW_MS = 10 * 60 * 1_000;
const MAX_RUNS_PER_WINDOW = 4;
const requestWindows = new Map<string, { count: number; resetAt: number }>();
let activeRuns = 0;

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function requesterId(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local-requester"
  );
}

function reserveRun(request: Request) {
  const now = Date.now();
  const id = requesterId(request);
  const current = requestWindows.get(id);
  const window =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + WINDOW_MS }
      : current;

  if (window.count >= MAX_RUNS_PER_WINDOW) {
    return false;
  }

  window.count += 1;
  requestWindows.set(id, window);
  return true;
}

export async function GET() {
  return response({
    model: "gpt-5.6-sol",
    liveModelConfigured: Boolean(process.env.OPENAI_API_KEY),
    mode:
      process.env.OPENAI_API_KEY &&
      process.env.DEADBOLT_ANALYSIS_MODE !== "fixture"
        ? "openai"
        : "fixture",
    demoAvailable: true,
    ownershipConfirmationRequired: true,
  });
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return response(
      {
        error: {
          code: "repository_too_large",
          message: "The repository snapshot exceeds the 750 KB request limit.",
        },
      },
      413,
    );
  }

  if (activeRuns >= 2) {
    return response(
      {
        error: {
          code: "analysis_busy",
          message: "Two analysis runs are already active. Try again shortly.",
        },
      },
      429,
    );
  }

  if (!reserveRun(request)) {
    return response(
      {
        error: {
          code: "analysis_rate_limited",
          message: "This client has reached the temporary analysis-run limit.",
        },
      },
      429,
    );
  }

  activeRuns += 1;
  try {
    const input = AnalyzeRequestSchema.parse(await request.json());
    const repository =
      input.source === "demo"
        ? await loadDemoRepository()
        : prepareRepository({
            ...input.repository,
            source: "upload",
          });
    const report = await analysisProvider.analyze(repository);
    return response({ report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response(
        {
          error: {
            code: "invalid_repository",
            message:
              "The repository snapshot does not match Deadbolt’s bounded intake contract.",
            details: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        400,
      );
    }

    if (error instanceof AnalysisProviderUnavailableError) {
      return response(
        {
          error: {
            code: "live_provider_unavailable",
            message: error.message,
          },
        },
        503,
      );
    }

    const message =
      error instanceof Error && error.message.startsWith("No supported")
        ? error.message
        : "The analysis run could not be completed.";
    return response(
      {
        error: {
          code: "analysis_failed",
          message,
        },
      },
      500,
    );
  } finally {
    activeRuns -= 1;
  }
}
