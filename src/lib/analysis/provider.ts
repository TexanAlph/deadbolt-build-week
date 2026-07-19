import { randomUUID } from "node:crypto";
import { runFixtureAnalysis } from "./fixture-provider";
import { runOpenAIAnalysis } from "./openai-provider";
import type { AnalysisReport } from "./schemas";
import type { PreparedRepository } from "./repository";

export class AnalysisProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisProviderUnavailableError";
  }
}

export interface AnalysisProvider {
  analyze(repository: PreparedRepository): Promise<AnalysisReport>;
}

class DeadboltAnalysisProvider implements AnalysisProvider {
  async analyze(repository: PreparedRepository) {
    const startedAt = Date.now();
    const runId = `db_${randomUUID()}`;
    const configuredMode = process.env.DEADBOLT_ANALYSIS_MODE ?? "auto";
    const canUseOpenAI =
      Boolean(process.env.OPENAI_API_KEY) && configuredMode !== "fixture";

    if (canUseOpenAI) {
      return runOpenAIAnalysis(repository, runId, startedAt);
    }

    if (repository.snapshot.source === "demo") {
      return runFixtureAnalysis(
        repository,
        runId,
        Date.now() - startedAt,
      );
    }

    throw new AnalysisProviderUnavailableError(
      "The API-backed GPT-5.6 Sol engine is not configured. Add OPENAI_API_KEY to enable source analysis. Codex session access is not used by this web engine; use the separate $deadbolt Skill for a keyless source audit.",
    );
  }
}

export const analysisProvider: AnalysisProvider =
  new DeadboltAnalysisProvider();
