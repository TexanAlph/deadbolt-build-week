export function browserUploadPath(
  fileName: string,
  webkitRelativePath: string,
) {
  const selectedPath = webkitRelativePath.trim() || fileName;
  const normalized = selectedPath.replaceAll("\\", "/");
  const segments = normalized.split("/").filter(Boolean);
  const repositoryRelativeSegments =
    webkitRelativePath.trim() && segments.length > 1
      ? segments.slice(1)
      : segments;

  if (
    normalized.includes("\0") ||
    repositoryRelativeSegments.length === 0 ||
    repositoryRelativeSegments.some((segment) => segment === "..")
  ) {
    throw new Error(`Unsafe browser upload path: ${selectedPath}`);
  }

  return repositoryRelativeSegments.join("/");
}
