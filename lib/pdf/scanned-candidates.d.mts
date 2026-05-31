export type DocumentProfile = "clean-office" | "mixed" | "image-heavy" | "scanned-heavy";

export type RenderCandidate = {
  label: string;
  quality: number;
  scale: number;
  grayscale?: boolean;
};

export type ScannedRenderCandidateOptions = {
  profile: DocumentProfile;
  originalBytes: number;
  bytesPerPage: number;
  targetBytes?: number;
  allowPortalLimitScan?: boolean;
};

export const baseScannedRenderCandidates: RenderCandidate[];
export const portalLimitRenderCandidates: RenderCandidate[];

export function shouldIncludePortalLimitScannedCandidates(
  options: ScannedRenderCandidateOptions
): boolean;

export function getScannedRenderCandidates(
  options: ScannedRenderCandidateOptions
): RenderCandidate[];
