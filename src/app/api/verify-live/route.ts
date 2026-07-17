import { z } from "zod";
import {
  LiveVerificationRequestSchema,
  verifyOwnedStaging,
} from "@/lib/live-verification";

export const runtime = "nodejs";
export const maxDuration = 30;

const WINDOW_MS = 10 * 60 * 1_000;
const MAX_RUNS = 5;
const windows = new Map<string, { count: number; resetAt: number }>();

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function reserve(request: Request) {
  const now = Date.now();
  const id =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local-requester";
  const current = windows.get(id);
  const window =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + WINDOW_MS }
      : current;

  if (window.count >= MAX_RUNS) {
    return false;
  }

  window.count += 1;
  windows.set(id, window);
  return true;
}

export async function POST(request: Request) {
  if (!reserve(request)) {
    return response(
      {
        error: {
          code: "verification_rate_limited",
          message: "This client has reached the temporary verification limit.",
        },
      },
      429,
    );
  }

  try {
    const input = LiveVerificationRequestSchema.parse(
      await request.json(),
    );
    const result = await verifyOwnedStaging(input);
    return response({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response(
        {
          error: {
            code: "invalid_verification_request",
            message:
              "Provide an HTTPS staging URL, ownership token, and explicit ownership confirmation.",
          },
        },
        400,
      );
    }

    return response(
      {
        error: {
          code: "verification_failed",
          message:
            error instanceof Error
              ? error.message
              : "Live verification could not be completed.",
        },
      },
      400,
    );
  }
}
