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
      "Live GPT-5.6 Sol analysis is not configured yet. Use the InvoicePilot demo or add OPENAI_API_KEY.",
    );
  }
}

export const analysisProvider: AnalysisProvider =
  new DeadboltAnalysisProvider();
