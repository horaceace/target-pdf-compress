import type { CompressionMode } from "./compress";
import type { DocumentProfile } from "./scanned-candidates.mjs";

export type BrowserLimitAction = {
  title: string;
  copy: string;
  severity: "target" | "resistant";
};

export type BrowserLimitActionInput = {
  mode: CompressionMode;
  targetBytes?: number;
  compressedBytes: number;
  reductionRatio: number;
  documentProfile: DocumentProfile;
};

export function getBrowserLimitAction(
  options: BrowserLimitActionInput
): BrowserLimitAction | null;

export function shouldTrackBrowserLimitAction(
  options: BrowserLimitActionInput
): boolean;
