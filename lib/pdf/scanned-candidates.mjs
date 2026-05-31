export const baseScannedRenderCandidates = [
  { label: "balanced scan", quality: 0.72, scale: 1.35 },
  { label: "smaller scan", quality: 0.62, scale: 1.15 },
  { label: "smallest scan", quality: 0.52, scale: 0.95 },
  { label: "grayscale scan", quality: 0.56, scale: 1.05, grayscale: true }
];

export const portalLimitRenderCandidates = [
  { label: "portal limit scan", quality: 0.44, scale: 0.82 },
  { label: "portal grayscale scan", quality: 0.46, scale: 0.88, grayscale: true }
];

export function shouldIncludePortalLimitScannedCandidates({
  profile,
  originalBytes,
  bytesPerPage,
  targetBytes,
  allowPortalLimitScan = false
}) {
  const strictUploadTarget = Boolean(
    targetBytes && (targetBytes <= 1024 * 1024 || targetBytes < originalBytes * 0.45)
  );
  const targetBelowPageWeight = Boolean(targetBytes && targetBytes < bytesPerPage);
  const eligibleProfile =
    profile === "scanned-heavy" || profile === "image-heavy" || bytesPerPage > 2_000_000;

  return Boolean((allowPortalLimitScan || strictUploadTarget || targetBelowPageWeight) && eligibleProfile);
}

export function getScannedRenderCandidates(options) {
  if (shouldIncludePortalLimitScannedCandidates(options)) {
    return [...baseScannedRenderCandidates, ...portalLimitRenderCandidates];
  }

  return baseScannedRenderCandidates;
}
