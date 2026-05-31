import assert from "node:assert/strict";

import {
  getScannedRenderCandidates,
  shouldIncludePortalLimitScannedCandidates
} from "../lib/pdf/scanned-candidates.mjs";
import {
  getBrowserLimitAction,
  shouldTrackBrowserLimitAction
} from "../lib/pdf/browser-limit-action.mjs";

const MB = 1024 * 1024;

function labels(candidates) {
  return candidates.map((candidate) => candidate.label);
}

function assertPortalCandidate(options, message) {
  assert.equal(shouldIncludePortalLimitScannedCandidates(options), true, message);
  assert.deepEqual(
    labels(getScannedRenderCandidates(options)).slice(-2),
    ["portal limit scan", "portal grayscale scan"],
    `${message}: expected portal-limit candidates to be appended`
  );
}

function assertNoPortalCandidate(options, message) {
  assert.equal(shouldIncludePortalLimitScannedCandidates(options), false, message);
  assert.equal(
    labels(getScannedRenderCandidates(options)).includes("portal limit scan"),
    false,
    `${message}: expected no portal-limit candidate`
  );
}

assertPortalCandidate(
  {
    profile: "scanned-heavy",
    originalBytes: 8 * MB,
    bytesPerPage: 1.6 * MB,
    targetBytes: 1 * MB
  },
  "scanned-heavy PDFs with a 1 MB upload cap should try portal-limit scan"
);

assertPortalCandidate(
  {
    profile: "image-heavy",
    originalBytes: 10 * MB,
    bytesPerPage: 1.25 * MB,
    targetBytes: 4 * MB
  },
  "image-heavy PDFs with a target below 45% of original size should try portal-limit scan"
);

assertPortalCandidate(
  {
    profile: "image-heavy",
    originalBytes: 10 * MB,
    bytesPerPage: 1.25 * MB,
    allowPortalLimitScan: true
  },
  "explicit portal-limit scan flag should enable the candidate for image-heavy PDFs"
);

assertNoPortalCandidate(
  {
    profile: "image-heavy",
    originalBytes: 10 * MB,
    bytesPerPage: 1.25 * MB
  },
  "image-heavy PDFs without a strict target should stay on the safer scanned candidates"
);

assertNoPortalCandidate(
  {
    profile: "clean-office",
    originalBytes: 500 * 1024,
    bytesPerPage: 80 * 1024,
    targetBytes: 500 * 1024,
    allowPortalLimitScan: true
  },
  "clean office PDFs should not get portal-limit scan candidates under normal page weight"
);

assertPortalCandidate(
  {
    profile: "clean-office",
    originalBytes: 12 * MB,
    bytesPerPage: 2.5 * MB,
    targetBytes: 1 * MB
  },
  "very high bytes-per-page PDFs can try portal-limit scan even if profile detection is conservative"
);

assert.equal(
  getBrowserLimitAction({
    mode: "scanned",
    targetBytes: 1 * MB,
    compressedBytes: 1.4 * MB,
    reductionRatio: 0.82,
    documentProfile: "scanned-heavy"
  })?.severity,
  "target",
  "scanned mode should surface browser path limit when a strict target is still missed"
);

assert.equal(
  getBrowserLimitAction({
    mode: "extreme",
    compressedBytes: 900 * 1024,
    reductionRatio: 0.04,
    documentProfile: "clean-office"
  })?.severity,
  "resistant",
  "extreme mode with low reduction on clean PDFs should point to external structure optimizers"
);

assert.equal(
  shouldTrackBrowserLimitAction({
    mode: "strong",
    targetBytes: 1 * MB,
    compressedBytes: 1.4 * MB,
    reductionRatio: 0.2,
    documentProfile: "mixed"
  }),
  false,
  "strong mode should not be treated as exhausted because stronger browser modes still exist"
);

assert.equal(
  shouldTrackBrowserLimitAction({
    mode: "scanned",
    targetBytes: 1 * MB,
    compressedBytes: 800 * 1024,
    reductionRatio: 0.7,
    documentProfile: "scanned-heavy"
  }),
  false,
  "scanned mode should not surface browser limit when the target is already met"
);

console.log("Compression strategy tests passed.");
