import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import {
  RepositorySnapshotSchema,
  type Evidence,
  type EvidenceDigest,
  type HuntClass,
  type RepositoryFile,
  type RepositorySnapshot,
  huntClasses,
} from "./schemas";

export const MAX_REPOSITORY_FILES = 100;
export const MAX_FILE_CHARACTERS = 40_000;
export const MAX_REPOSITORY_CHARACTERS = 320_000;

const allowedExtensions = new Set([
  ".cjs",
  ".css",
  ".env.example",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".py",
  ".rb",
  ".rs",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

const deniedBasenames = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  "id_rsa",
  "id_ed25519",
]);

const deniedSegments = new Set([
  ".git",
  ".next",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

export const demoRepositoryPaths = [
  "samples/invoice-pilot/README.md",
  "samples/invoice-pilot/next.config.ts",
  "samples/invoice-pilot/package.json",
  "samples/invoice-pilot/vercel.json",
  "samples/invoice-pilot/src/app/api/auth/login/route.ts",
  "samples/invoice-pilot/src/app/api/auth/logout/route.ts",
  "samples/invoice-pilot/src/app/api/invoices/[id]/route.ts",
  "samples/invoice-pilot/src/app/api/invoices/route.ts",
  "samples/invoice-pilot/src/app/api/reports/export/route.ts",
  "samples/invoice-pilot/src/app/invoice/[id]/page.tsx",
  "samples/invoice-pilot/src/app/layout.tsx",
  "samples/invoice-pilot/src/app/login/page.tsx",
  "samples/invoice-pilot/src/app/page.tsx",
  "samples/invoice-pilot/src/components/app-shell.tsx",
  "samples/invoice-pilot/src/components/login-form.tsx",
  "samples/invoice-pilot/src/components/provider-status.tsx",
  "samples/invoice-pilot/src/lib/client-config.ts",
  "samples/invoice-pilot/src/lib/data.ts",
  "samples/invoice-pilot/supabase/migrations/001_create_invoices.sql",
] as const;

export interface PreparedRepository {
  snapshot: RepositorySnapshot;
  excludedFiles: string[];
  characters: number;
}

function normalizedExtension(path: string) {
  if (path.toLowerCase().endsWith(".env.example")) {
    return ".env.example";
  }

  return extname(path).toLowerCase();
}

export function normalizeRepositoryPath(path: string) {
  const normalized = path.replaceAll("\\", "/").replace(/^\.?\//, "");
  const segments = normalized.split("/").filter(Boolean);

  if (
    normalized.includes("\0") ||
    segments.length === 0 ||
    segments.some((segment) => segment === "..")
  ) {
    throw new Error(`Unsafe repository path: ${path}`);
  }

  return segments.join("/");
}

function shouldExcludeFile(path: string) {
  const segments = path.toLowerCase().split("/");
  const fileName = basename(path).toLowerCase();

  return (
    segments.some((segment) => deniedSegments.has(segment)) ||
    deniedBasenames.has(fileName) ||
    fileName.endsWith(".pem") ||
    fileName.endsWith(".key") ||
    !allowedExtensions.has(normalizedExtension(path))
  );
}

export function prepareRepository(
  input: RepositorySnapshot,
): PreparedRepository {
  const parsed = RepositorySnapshotSchema.parse(input);
  const excludedFiles: string[] = [];
  const accepted: RepositoryFile[] = [];
  let characters = 0;

  for (const file of parsed.files) {
    const path = normalizeRepositoryPath(file.path);

    if (
      shouldExcludeFile(path) ||
      file.content.includes("\0") ||
      file.content.length > MAX_FILE_CHARACTERS
    ) {
      excludedFiles.push(path);
      continue;
    }

    if (
      accepted.length >= MAX_REPOSITORY_FILES ||
      characters + file.content.length > MAX_REPOSITORY_CHARACTERS
    ) {
      excludedFiles.push(path);
      continue;
    }

    accepted.push({ path, content: file.content });
    characters += file.content.length;
  }

  if (accepted.length === 0) {
    throw new Error("No supported source files remained after intake filtering.");
  }

  return {
    snapshot: {
      ...parsed,
      files: accepted.sort((a, b) => a.path.localeCompare(b.path)),
    },
    excludedFiles,
    characters,
  };
}

export async function loadDemoRepository(): Promise<PreparedRepository> {
  const files = await Promise.all(
    demoRepositoryPaths.map(async (path) => ({
      path: path.replace("samples/invoice-pilot/", ""),
      content: await readFile(
        join(/* turbopackIgnore: true */ process.cwd(), path),
        "utf8",
      ),
    })),
  );

  return prepareRepository({
    name: "Internal Security Fixture",
    source: "demo",
    files,
  });
}

export function renderRepositoryIndex(snapshot: RepositorySnapshot) {
  return snapshot.files
    .map((file) => {
      const lines = file.content.split("\n").length;
      return `${file.path} · ${lines} lines · ${file.content.length} chars`;
    })
    .join("\n");
}

export function renderRepositoryBundle(snapshot: RepositorySnapshot) {
  return snapshot.files
    .map((file) => {
      const numbered = file.content
        .split("\n")
        .map((line, index) => `${String(index + 1).padStart(4, " ")} | ${line}`)
        .join("\n");
      return `<file path="${file.path}">\n${numbered}\n</file>`;
    })
    .join("\n\n");
}

export function searchRepository(
  snapshot: RepositorySnapshot,
  queries: string[],
  maxResults: number,
) {
  const matches: Array<{
    query: string;
    path: string;
    line: number;
    excerpt: string;
  }> = [];
  const cappedResults = Math.min(Math.max(maxResults, 1), 60);

  for (const query of queries.slice(0, 12)) {
    const needle = query.toLowerCase();

    for (const file of snapshot.files) {
      const lines = file.content.split("\n");
      for (let index = 0; index < lines.length; index += 1) {
        if (!lines[index].toLowerCase().includes(needle)) {
          continue;
        }

        matches.push({
          query,
          path: file.path,
          line: index + 1,
          excerpt: lines[index].trim().slice(0, 320),
        });

        if (matches.length >= cappedResults) {
          return { matches, truncated: true };
        }
      }
    }
  }

  return { matches, truncated: false };
}

export function readRepositoryFiles(
  snapshot: RepositorySnapshot,
  requests: Array<{ path: string; startLine: number; endLine: number }>,
) {
  return {
    files: requests.slice(0, 10).map((request) => {
      const file = snapshot.files.find((candidate) => candidate.path === request.path);
      if (!file) {
        return {
          path: request.path,
          startLine: request.startLine,
          endLine: request.endLine,
          content: "",
          found: false,
        };
      }

      const lines = file.content.split("\n");
      const startLine = Math.min(Math.max(request.startLine, 1), lines.length);
      const endLine = Math.min(
        Math.max(request.endLine, startLine),
        Math.min(lines.length, startLine + 79),
      );

      return {
        path: request.path,
        startLine,
        endLine,
        content: lines
          .slice(startLine - 1, endLine)
          .map(
            (line, index) =>
              `${String(startLine + index).padStart(4, " ")} | ${line}`,
          )
          .join("\n"),
        found: true,
      };
    }),
  };
}

const localLeadQueries: Record<HuntClass, string[]> = {
  secrets: ["sk_", "api_key", "secret", "use client"],
  auth_idor: ["ownerId", "owner_id", "cookies.set", "grant", "login", "logout"],
  injection: ["exec(", "spawn(", "eval(", "query(", "searchParams", "request.json"],
  config: ["Access-Control-Allow-Origin", "stack", "NODE_ENV", "headers()"],
};

export function buildLocalEvidenceDigest(
  snapshot: RepositorySnapshot,
): EvidenceDigest {
  return {
    groups: huntClasses.map((huntClass) => {
      const results = searchRepository(
        snapshot,
        localLeadQueries[huntClass],
        16,
      ).matches;
      const leads: Evidence[] = results.slice(0, 12).map((match) => ({
        path: match.path,
        startLine: match.line,
        endLine: match.line,
        excerpt: match.excerpt,
        reason: `Deterministic lead for the ${huntClass} pass from query "${match.query}".`,
      }));

      return {
        huntClass,
        leads,
        noEvidenceNote:
          leads.length === 0
            ? `No deterministic ${huntClass} leads were found.`
            : null,
      };
    }),
  };
}
