import type { Finding, HuntClass, HuntPass } from "./schemas";

const huntIdPrefixes: Record<HuntClass, string> = {
  secrets: "SEC",
  auth_idor: "AUTH",
  injection: "INJ",
  config: "CFG",
};

function nextCanonicalId(
  huntClass: HuntClass,
  usedIds: Set<string>,
  counters: Map<HuntClass, number>,
) {
  let next = (counters.get(huntClass) ?? 0) + 1;
  let candidate = "";

  do {
    candidate = `DB-${huntIdPrefixes[huntClass]}-${String(next).padStart(3, "0")}`;
    next += 1;
  } while (usedIds.has(candidate));

  counters.set(huntClass, next - 1);
  return candidate;
}

export function ensureUniqueFindingIds(
  findings: Finding[],
  reservedIds: Iterable<string> = [],
): Finding[] {
  const usedIds = new Set(
    [...reservedIds].map((id) => id.trim()).filter((id) => id.length > 0),
  );
  const counters = new Map<HuntClass, number>();

  return findings.map((finding) => {
    const requestedId = finding.id.trim();
    const id =
      requestedId.length > 0 && !usedIds.has(requestedId)
        ? requestedId
        : nextCanonicalId(finding.huntClass, usedIds, counters);
    usedIds.add(id);
    return id === finding.id ? finding : { ...finding, id };
  });
}

export function ensureGloballyUniqueFindingIds(
  passes: HuntPass[],
): HuntPass[] {
  const uniqueFindings = ensureUniqueFindingIds(
    passes.flatMap((pass) => pass.findings),
  );
  let findingIndex = 0;

  return passes.map((pass) => ({
    ...pass,
    findings: pass.findings.map(() => {
      const finding = uniqueFindings[findingIndex];
      findingIndex += 1;
      return finding;
    }),
  }));
}
