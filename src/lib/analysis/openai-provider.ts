import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseUsage,
  Tool,
} from "openai/resources/responses/responses";
import { z } from "zod";
import {
  AnalysisReportSchema,
  EvidenceDigestSchema,
  HuntPassSchema,
  ThreatModelSchema,
  type AnalysisReport,
  type EvidenceDigest,
  type Finding,
  type HuntClass,
  type HuntPass,
  type RepositorySnapshot,
  type Usage,
  huntClasses,
  severities,
} from "./schemas";
import {
  applyPatchPlans,
  type PatchPlan,
} from "./patch-engine";
import {
  buildLocalEvidenceDigest,
  readRepositoryFiles,
  renderRepositoryBundle,
  renderRepositoryIndex,
  searchRepository,
  type PreparedRepository,
} from "./repository";
import {
  CORE_HUNT_PROMPT,
  EVIDENCE_REDUCTION_PROMPT,
  PATCH_PROMPT,
  RETEST_PROMPT,
  THREAT_MODEL_PROMPT,
  huntInstructions,
} from "./prompts";

const SOL_MODEL = "gpt-5.6-sol";
const TERRA_MODEL = "gpt-5.6-terra";
const MAX_PTC_TURNS = 4;
const MAX_PTC_CALLS = 12;

const SearchArgumentsSchema = z
  .object({
    queries: z.array(z.string().min(1).max(120)).min(1).max(12),
    maxResults: z.number().int().min(1).max(60),
  })
  .strict();

const ReadArgumentsSchema = z
  .object({
    requests: z
      .array(
        z
          .object({
            path: z.string().min(1).max(240),
            startLine: z.number().int().positive(),
            endLine: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1)
      .max(10),
  })
  .strict();

const PatchBundleSchema = z
  .object({
    plans: z.array(
      z
        .object({
          findingId: z.string(),
          summary: z.string(),
          edits: z
            .array(
              z
                .object({
                  path: z.string(),
                  expected: z.string(),
                  replacement: z.string(),
                })
                .strict(),
            )
            .min(1)
            .max(8),
        })
        .strict(),
    ),
  })
  .strict();

const RetestBundleSchema = z
  .object({
    results: z.array(
      z
        .object({
          findingId: z.string(),
          status: z.enum(["passed", "failed"]),
          evidence: z.string(),
        })
        .strict(),
    ),
  })
  .strict();

const tools: Tool[] = [
  {
    type: "function",
    name: "search_repository",
    description:
      "Search source lines. Returns compact matches with query, path, line, excerpt, and a truncation flag.",
    strict: true,
    allowed_callers: ["programmatic"],
    parameters: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 12,
        },
        maxResults: { type: "integer", minimum: 1, maximum: 60 },
      },
      required: ["queries", "maxResults"],
      additionalProperties: false,
    },
    output_schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              query: { type: "string" },
              path: { type: "string" },
              line: { type: "integer" },
              excerpt: { type: "string" },
            },
            required: ["query", "path", "line", "excerpt"],
            additionalProperties: false,
          },
        },
        truncated: { type: "boolean" },
      },
      required: ["matches", "truncated"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "read_repository_files",
    description:
      "Read bounded line ranges from known repository paths. Returns compact numbered source ranges and a found flag.",
    strict: true,
    allowed_callers: ["programmatic"],
    parameters: {
      type: "object",
      properties: {
        requests: {
          type: "array",
          minItems: 1,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              path: { type: "string" },
              startLine: { type: "integer", minimum: 1 },
              endLine: { type: "integer", minimum: 1 },
            },
            required: ["path", "startLine", "endLine"],
            additionalProperties: false,
          },
        },
      },
      required: ["requests"],
      additionalProperties: false,
    },
    output_schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: { type: "string" },
              startLine: { type: "integer" },
              endLine: { type: "integer" },
              content: { type: "string" },
              found: { type: "boolean" },
            },
            required: [
              "path",
              "startLine",
              "endLine",
              "content",
              "found",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["files"],
      additionalProperties: false,
    },
  },
  { type: "programmatic_tool_calling" },
];

class UsageCollector {
  private totals: Usage = {
    requestCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    cachedTokens: 0,
    cacheWriteTokens: 0,
  };

  add(usage: ResponseUsage | undefined) {
    if (!usage) {
      return;
    }

    this.totals.requestCount += 1;
    this.totals.inputTokens += usage.input_tokens;
    this.totals.outputTokens += usage.output_tokens;
    this.totals.reasoningTokens +=
      usage.output_tokens_details.reasoning_tokens;
    this.totals.cachedTokens += usage.input_tokens_details.cached_tokens;
    this.totals.cacheWriteTokens +=
      usage.input_tokens_details.cache_write_tokens;
  }

  value() {
    return { ...this.totals };
  }
}

function stableDeveloperMessage(text: string): ResponseInputItem {
  return {
    role: "developer",
    content: [
      {
        type: "input_text",
        text,
        prompt_cache_breakpoint: { mode: "explicit" },
      },
    ],
  };
}

function requireParsed<T>(value: T | null, stage: string): T {
  if (!value) {
    throw new Error(`${stage} returned no structured output.`);
  }

  return value;
}

function parseJsonText(text: string) {
  const trimmed = text.trim();
  const unfenced = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  return JSON.parse(unfenced) as unknown;
}

function fingerprintFinding(finding: Finding) {
  return [
    finding.huntClass,
    finding.category,
    finding.file,
    finding.line,
  ].join(":");
}

function distillFindings(passes: HuntPass[]) {
  const severityRank = new Map(severities.map((value, index) => [value, index]));
  const byFingerprint = new Map<string, Finding>();

  for (const finding of passes.flatMap((pass) => pass.findings)) {
    const fingerprint = fingerprintFinding(finding);
    const existing = byFingerprint.get(fingerprint);
    if (!existing || finding.confidence > existing.confidence) {
      byFingerprint.set(fingerprint, finding);
    }
  }

  return [...byFingerprint.values()].sort((a, b) => {
    const severityDifference =
      (severityRank.get(a.severity) ?? 99) -
      (severityRank.get(b.severity) ?? 99);
    return severityDifference || a.id.localeCompare(b.id);
  });
}

async function executeToolCall(
  snapshot: RepositorySnapshot,
  call: ResponseFunctionToolCall,
) {
  if (call.name === "search_repository") {
    const args = SearchArgumentsSchema.parse(JSON.parse(call.arguments));
    return searchRepository(snapshot, args.queries, args.maxResults);
  }

  if (call.name === "read_repository_files") {
    const args = ReadArgumentsSchema.parse(JSON.parse(call.arguments));
    return readRepositoryFiles(snapshot, args.requests);
  }

  throw new Error(`Unsupported evidence tool: ${call.name}`);
}

async function runPtcEvidenceAttempt(
  client: OpenAI,
  snapshot: RepositorySnapshot,
  usage: UsageCollector,
) {
  const input: ResponseInputItem[] = [
    stableDeveloperMessage(EVIDENCE_REDUCTION_PROMPT),
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Reduce evidence for this repository index:\n\n${renderRepositoryIndex(snapshot)}`,
        },
      ],
    },
  ];
  let totalCalls = 0;

  for (let turn = 0; turn < MAX_PTC_TURNS; turn += 1) {
    const response = await client.responses.create({
      model: TERRA_MODEL,
      store: false,
      input,
      tools,
      parallel_tool_calls: true,
      reasoning: { effort: "medium", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      prompt_cache_key: "deadbolt:evidence-reducer:v1",
      prompt_cache_options: { mode: "explicit", ttl: "30m" },
      safety_identifier: "deadbolt-self-audit",
      max_output_tokens: 8_000,
      metadata: { stage: "evidence_reduction" },
    });

    usage.add(response.usage);
    if (response.status !== "completed") {
      throw new Error(`Evidence reduction ended with ${response.status}.`);
    }

    input.push(...(response.output as ResponseInputItem[]));
    const calls = response.output.filter(
      (item): item is ResponseFunctionToolCall => item.type === "function_call",
    );

    if (calls.length > 0) {
      totalCalls += calls.length;
      if (totalCalls > MAX_PTC_CALLS) {
        throw new Error("Evidence reduction exceeded its tool-call limit.");
      }

      const outputs = await Promise.all(
        calls.map(async (call) => ({
          type: "function_call_output" as const,
          call_id: call.call_id,
          output: JSON.stringify(await executeToolCall(snapshot, call)),
          caller: call.caller,
        })),
      );
      input.push(...(outputs as ResponseInputItem[]));
      continue;
    }

    if (response.output_text) {
      return EvidenceDigestSchema.parse(parseJsonText(response.output_text));
    }
  }

  throw new Error("Evidence reduction did not produce a final digest.");
}

async function reduceEvidence(
  client: OpenAI,
  snapshot: RepositorySnapshot,
  usage: UsageCollector,
): Promise<{ digest: EvidenceDigest; ptcStatus: "executed" | "fallback_local" }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const digest = await runPtcEvidenceAttempt(client, snapshot, usage);
      return { digest, ptcStatus: "executed" };
    } catch {
      if (attempt === 1) {
        break;
      }
    }
  }

  return {
    digest: buildLocalEvidenceDigest(snapshot),
    ptcStatus: "fallback_local",
  };
}

async function runThreatModel(
  client: OpenAI,
  snapshot: RepositorySnapshot,
  usage: UsageCollector,
) {
  const response = await client.responses.parse({
    model: SOL_MODEL,
    store: false,
    input: [
      stableDeveloperMessage(THREAT_MODEL_PROMPT),
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Threat-model this repository.\n\n${renderRepositoryBundle(snapshot)}`,
          },
        ],
      },
    ],
    reasoning: { effort: "max", summary: "auto" },
    text: {
      format: zodTextFormat(ThreatModelSchema, "deadbolt_threat_model"),
      verbosity: "low",
    },
    include: ["reasoning.encrypted_content"],
    prompt_cache_key: "deadbolt:threat-model:v1",
    prompt_cache_options: { mode: "explicit", ttl: "30m" },
    safety_identifier: "deadbolt-self-audit",
    max_output_tokens: 12_000,
    metadata: { stage: "threat_model" },
  });
  usage.add(response.usage);
  return requireParsed(response.output_parsed, "Threat model");
}

async function runHuntPass(
  client: OpenAI,
  snapshot: RepositorySnapshot,
  threatModel: z.infer<typeof ThreatModelSchema>,
  digest: EvidenceDigest,
  huntClass: HuntClass,
  usage: UsageCollector,
) {
  const group = digest.groups.find((item) => item.huntClass === huntClass);
  const response = await client.responses.parse({
    model: SOL_MODEL,
    store: false,
    input: [
      stableDeveloperMessage(CORE_HUNT_PROMPT),
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Run only the ${huntClass} hunt pass.`,
              huntInstructions[huntClass],
              `<threat_model>${JSON.stringify(threatModel)}</threat_model>`,
              `<reduced_evidence>${JSON.stringify(group)}</reduced_evidence>`,
              `<repository>${renderRepositoryBundle(snapshot)}</repository>`,
            ].join("\n\n"),
          },
        ],
      },
    ],
    reasoning: { effort: "max", summary: "auto" },
    text: {
      format: zodTextFormat(HuntPassSchema, `deadbolt_${huntClass}_pass`),
      verbosity: "medium",
    },
    include: ["reasoning.encrypted_content"],
    prompt_cache_key: "deadbolt:parallel-hunts:v1",
    prompt_cache_options: { mode: "explicit", ttl: "30m" },
    safety_identifier: "deadbolt-self-audit",
    max_output_tokens: 18_000,
    metadata: { stage: "hunt", hunt_class: huntClass },
  });
  usage.add(response.usage);
  const parsed = requireParsed(response.output_parsed, `${huntClass} hunt`);
  return HuntPassSchema.parse({
    ...parsed,
    agentId: `sol-${huntClass}`,
    huntClass,
  });
}

async function runPatchAndRetest(
  client: OpenAI,
  snapshot: RepositorySnapshot,
  findings: Finding[],
  usage: UsageCollector,
) {
  if (findings.length === 0) {
    return {
      findings,
      summary: {
        sandboxed: true as const,
        originalRepositoryUnchanged: true as const,
        patchesGenerated: 0,
        patchesApplied: 0,
        retestsPassed: 0,
        retestsFailed: 0,
      },
    };
  }

  const patchResponse = await client.responses.parse({
    model: SOL_MODEL,
    store: false,
    input: [
      stableDeveloperMessage(PATCH_PROMPT),
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `<findings>${JSON.stringify(findings)}</findings>`,
              `<repository>${renderRepositoryBundle(snapshot)}</repository>`,
            ].join("\n\n"),
          },
        ],
      },
    ],
    reasoning: { effort: "max", summary: "auto" },
    text: {
      format: zodTextFormat(PatchBundleSchema, "deadbolt_patch_bundle"),
      verbosity: "medium",
    },
    include: ["reasoning.encrypted_content"],
    prompt_cache_key: "deadbolt:patch:v1",
    prompt_cache_options: { mode: "explicit", ttl: "30m" },
    safety_identifier: "deadbolt-self-audit",
    max_output_tokens: 24_000,
    metadata: { stage: "patch" },
  });
  usage.add(patchResponse.usage);
  const bundle = requireParsed(
    patchResponse.output_parsed,
    "Patch generation",
  );
  const knownFindingIds = new Set(findings.map((finding) => finding.id));
  const plans: PatchPlan[] = bundle.plans
    .filter((plan) => knownFindingIds.has(plan.findingId))
    .map((plan) => ({ ...plan }));
  const { sandbox, results } = applyPatchPlans(snapshot, plans);
  const patchesByFinding = new Map(
    results.map((result) => [result.findingId, result]),
  );
  const appliedFindingIds = results
    .filter((result) => result.applied)
    .map((result) => result.findingId);

  let retestResults: z.infer<typeof RetestBundleSchema>["results"] = [];
  if (appliedFindingIds.length > 0) {
    const retestResponse = await client.responses.parse({
      model: SOL_MODEL,
      store: false,
      input: [
        stableDeveloperMessage(RETEST_PROMPT),
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `<findings>${JSON.stringify(
                  findings.filter((finding) =>
                    appliedFindingIds.includes(finding.id),
                  ),
                )}</findings>`,
                `<patched_repository>${renderRepositoryBundle(sandbox)}</patched_repository>`,
              ].join("\n\n"),
            },
          ],
        },
      ],
      reasoning: { effort: "max", summary: "auto" },
      text: {
        format: zodTextFormat(RetestBundleSchema, "deadbolt_retest_bundle"),
        verbosity: "medium",
      },
      include: ["reasoning.encrypted_content"],
      prompt_cache_key: "deadbolt:retest:v1",
      prompt_cache_options: { mode: "explicit", ttl: "30m" },
      safety_identifier: "deadbolt-self-audit",
      max_output_tokens: 16_000,
      metadata: { stage: "retest" },
    });
    usage.add(retestResponse.usage);
    retestResults = requireParsed(
      retestResponse.output_parsed,
      "Patch re-test",
    ).results;
  }

  const retestByFinding = new Map(
    retestResults.map((result) => [result.findingId, result]),
  );
  const remediatedFindings = findings.map((finding): Finding => {
    const patch = patchesByFinding.get(finding.id);
    const retest = retestByFinding.get(finding.id);

    return {
      ...finding,
      patchDiff: patch?.diff || null,
      patchStatus: patch?.applied
        ? "applied_to_sandbox"
        : patch?.diff
          ? "generated"
          : "not_generated",
      retestStatus: patch?.applied
        ? (retest?.status ?? "failed")
        : "not_run",
      retestEvidence:
        retest?.evidence ??
        patch?.error ??
        "No exact patch could be applied to the sandbox.",
    };
  });

  return {
    findings: remediatedFindings,
    summary: {
      sandboxed: true as const,
      originalRepositoryUnchanged: true as const,
      patchesGenerated: results.filter((result) => result.diff).length,
      patchesApplied: results.filter((result) => result.applied).length,
      retestsPassed: remediatedFindings.filter(
        (finding) => finding.retestStatus === "passed",
      ).length,
      retestsFailed: remediatedFindings.filter(
        (finding) => finding.retestStatus === "failed",
      ).length,
    },
  };
}

export async function runOpenAIAnalysis(
  repository: PreparedRepository,
  runId: string,
  startedAt: number,
): Promise<AnalysisReport> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const usage = new UsageCollector();
  const threatModel = await runThreatModel(
    client,
    repository.snapshot,
    usage,
  );
  const { digest, ptcStatus } = await reduceEvidence(
    client,
    repository.snapshot,
    usage,
  );
  const passes = await Promise.all(
    huntClasses.map((huntClass) =>
      runHuntPass(
        client,
        repository.snapshot,
        threatModel,
        digest,
        huntClass,
        usage,
      ),
    ),
  );
  const distilled = distillFindings(passes);
  const remediation = await runPatchAndRetest(
    client,
    repository.snapshot,
    distilled,
    usage,
  );
  const remediatedById = new Map(
    remediation.findings.map((finding) => [finding.id, finding]),
  );
  const remediatedPasses = passes.map((pass) => ({
    ...pass,
    findings: pass.findings.map(
      (finding) => remediatedById.get(finding.id) ?? finding,
    ),
  }));
  const completedClasses = passes.map((pass) => pass.huntClass);
  const cleanClasses = passes
    .filter((pass) => pass.findings.length === 0)
    .map((pass) => pass.huntClass);

  return AnalysisReportSchema.parse({
    schemaVersion: "1.0.0",
    runId,
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    engine: {
      provider: "openai",
      model: SOL_MODEL,
      liveModel: true,
      reasoningEffort: "max",
      ptcStatus,
      promptCacheStatus: "measured",
    },
    repository: {
      name: repository.snapshot.name,
      source: repository.snapshot.source,
      filesAnalyzed: repository.snapshot.files.length,
      charactersAnalyzed: repository.characters,
      excludedFiles: repository.excludedFiles,
    },
    threatModel,
    passes: remediatedPasses,
    findings: remediation.findings,
    coverage: {
      requestedClasses: [...huntClasses],
      completedClasses,
      cleanClasses,
    },
    remediation: remediation.summary,
    usage: usage.value(),
  });
}
