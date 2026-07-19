import { z } from "zod";

export const huntClasses = [
  "secrets",
  "auth_idor",
  "injection",
  "config",
] as const;

export const severities = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
] as const;

export const repositorySources = ["demo", "upload"] as const;

export const RepositoryFileSchema = z
  .object({
    path: z.string().min(1).max(240),
    content: z.string().max(60_000),
  })
  .strict();

export const RepositorySnapshotSchema = z
  .object({
    name: z.string().min(1).max(80),
    source: z.enum(repositorySources),
    files: z.array(RepositoryFileSchema).min(1).max(120),
  })
  .strict();

export const AnalyzeRequestSchema = z.discriminatedUnion("source", [
  z
    .object({
      source: z.literal("demo"),
      ownershipConfirmed: z.literal(true),
    })
    .strict(),
  z
    .object({
      source: z.literal("upload"),
      ownershipConfirmed: z.literal(true),
      repository: RepositorySnapshotSchema,
    })
    .strict(),
]);

export const EvidenceSchema = z
  .object({
    path: z.string(),
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive(),
    excerpt: z.string(),
    reason: z.string(),
  })
  .strict();

export const ThreatModelSchema = z
  .object({
    summary: z.string(),
    architecture: z.array(z.string()),
    entryPoints: z.array(
      z
        .object({
          name: z.string(),
          kind: z.string(),
          path: z.string(),
          trustBoundary: z.string(),
        })
        .strict(),
    ),
    sensitiveAssets: z.array(
      z
        .object({
          name: z.string(),
          sensitivity: z.enum(["high", "medium", "low"]),
          paths: z.array(z.string()),
        })
        .strict(),
    ),
    authFlows: z.array(z.string()),
    dataFlows: z.array(z.string()),
    trustBoundaries: z.array(z.string()),
    assumptions: z.array(z.string()),
    priorityHunts: z.array(z.enum(huntClasses)),
  })
  .strict();

export const FindingSchema = z
  .object({
    id: z.string().trim().min(1),
    huntClass: z.enum(huntClasses),
    category: z.string(),
    severity: z.enum(severities),
    confidence: z.number().min(0).max(1),
    title: z.string(),
    file: z.string(),
    line: z.number().int().positive(),
    evidence: z.array(EvidenceSchema).min(1),
    plainEnglish: z.string(),
    exploitInPlainTerms: z.string(),
    remediationPlan: z.string(),
    patchDiff: z.string().nullable(),
    patchStatus: z.enum([
      "not_generated",
      "generated",
      "applied_to_sandbox",
    ]),
    retestStatus: z.enum(["not_run", "passed", "failed"]),
    retestEvidence: z.string().nullable(),
  })
  .strict();

export const VerificationResultSchema = z
  .object({
    findingId: z.string().trim().min(1),
    verdict: z.enum(["absent", "present", "inconclusive"]),
    summary: z.string().trim().min(1),
    checkedFiles: z.array(z.string().trim().min(1)).min(1),
    evidence: z.array(EvidenceSchema).min(1),
  })
  .strict();

export const HuntPassSchema = z
  .object({
    agentId: z.string().trim().min(1),
    huntClass: z.enum(huntClasses),
    summary: z.string().trim().min(1),
    findings: z.array(FindingSchema),
    checkedFiles: z.array(z.string().trim().min(1)).min(1),
    noFindingReason: z.string().trim().min(1).nullable(),
    verificationResults: z.array(VerificationResultSchema),
  })
  .strict()
  .superRefine((pass, context) => {
    const seen = new Set<string>();
    pass.findings.forEach((finding, index) => {
      if (seen.has(finding.id)) {
        context.addIssue({
          code: "custom",
          path: ["findings", index, "id"],
          message: `Finding ID "${finding.id}" must be unique within its hunt pass.`,
        });
      }
      seen.add(finding.id);
    });
  });

export const EvidenceGroupSchema = z
  .object({
    huntClass: z.enum(huntClasses),
    leads: z.array(EvidenceSchema),
    noEvidenceNote: z.string().nullable(),
  })
  .strict();

export const EvidenceDigestSchema = z
  .object({
    groups: z.array(EvidenceGroupSchema).length(huntClasses.length),
  })
  .strict();

export const UsageSchema = z
  .object({
    requestCount: z.number().int().nonnegative(),
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    reasoningTokens: z.number().int().nonnegative(),
    cachedTokens: z.number().int().nonnegative(),
    cacheWriteTokens: z.number().int().nonnegative(),
  })
  .strict();

export const AnalysisReportSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    runId: z.string(),
    generatedAt: z.string(),
    elapsedMs: z.number().int().nonnegative(),
    engine: z
      .object({
        provider: z.enum(["openai", "fixture"]),
        model: z.string(),
        liveModel: z.boolean(),
        reasoningEffort: z.enum(["fixture", "max"]),
        ptcStatus: z.enum([
          "executed",
          "fallback_local",
          "fixture_simulated",
        ]),
        promptCacheStatus: z.enum(["measured", "wired_unmeasured"]),
      })
      .strict(),
    repository: z
      .object({
        name: z.string(),
        source: z.enum(repositorySources),
        filesAnalyzed: z.number().int().positive(),
        charactersAnalyzed: z.number().int().positive(),
        excludedFiles: z.array(z.string()),
      })
      .strict(),
    threatModel: ThreatModelSchema,
    passes: z.array(HuntPassSchema).length(huntClasses.length),
    findings: z.array(FindingSchema),
    coverage: z
      .object({
        requestedClasses: z.array(z.enum(huntClasses)),
        completedClasses: z.array(z.enum(huntClasses)),
        cleanClasses: z.array(z.enum(huntClasses)),
      })
      .strict(),
    remediation: z
      .object({
        sandboxed: z.literal(true),
        originalRepositoryUnchanged: z.literal(true),
        patchesGenerated: z.number().int().nonnegative(),
        patchesApplied: z.number().int().nonnegative(),
        retestsPassed: z.number().int().nonnegative(),
        retestsFailed: z.number().int().nonnegative(),
      })
      .strict(),
    usage: UsageSchema,
  })
  .strict()
  .superRefine((report, context) => {
    const reportIds = new Set<string>();
    report.findings.forEach((finding, index) => {
      if (reportIds.has(finding.id)) {
        context.addIssue({
          code: "custom",
          path: ["findings", index, "id"],
          message: `Finding ID "${finding.id}" must be globally unique.`,
        });
      }
      reportIds.add(finding.id);
    });

    const passIds = new Set<string>();
    report.passes.forEach((pass, passIndex) => {
      pass.findings.forEach((finding, findingIndex) => {
        if (passIds.has(finding.id)) {
          context.addIssue({
            code: "custom",
            path: ["passes", passIndex, "findings", findingIndex, "id"],
            message: `Finding ID "${finding.id}" must be globally unique across hunt passes.`,
          });
        }
        if (!reportIds.has(finding.id)) {
          context.addIssue({
            code: "custom",
            path: ["passes", passIndex, "findings", findingIndex, "id"],
            message: `Finding ID "${finding.id}" is missing from the report finding index.`,
          });
        }
        passIds.add(finding.id);
      });
    });
  });

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type EvidenceDigest = z.infer<typeof EvidenceDigestSchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type HuntClass = (typeof huntClasses)[number];
export type HuntPass = z.infer<typeof HuntPassSchema>;
export type RepositoryFile = z.infer<typeof RepositoryFileSchema>;
export type RepositorySnapshot = z.infer<typeof RepositorySnapshotSchema>;
export type ThreatModel = z.infer<typeof ThreatModelSchema>;
export type Usage = z.infer<typeof UsageSchema>;
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
