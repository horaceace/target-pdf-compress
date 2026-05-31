export function getBrowserLimitAction({
  mode,
  targetBytes,
  compressedBytes,
  reductionRatio,
  documentProfile
}) {
  const targetMissed = Boolean(targetBytes && compressedBytes > targetBytes);
  const reductionPercent = Math.round(reductionRatio * 100);
  const browserPathExhausted = mode === "scanned" || mode === "extreme";

  if (targetMissed && browserPathExhausted) {
    return {
      title: "Browser path limit reached",
      copy:
        "This file is still above the selected upload limit after the strongest browser-side path. Split the PDF, lower image detail only if acceptable, or use a server-side qpdf/pdfcpu/Ghostscript pass once available.",
      severity: "target"
    };
  }

  if (
    reductionPercent < 8 &&
    browserPathExhausted &&
    (documentProfile === "clean-office" || documentProfile === "mixed")
  ) {
    return {
      title: "This PDF is resisting browser compression",
      copy:
        "The document may already be structurally compact. Further reduction likely needs an external optimizer such as qpdf or pdfcpu rather than another browser retry.",
      severity: "resistant"
    };
  }

  return null;
}

export function shouldTrackBrowserLimitAction(options) {
  return Boolean(getBrowserLimitAction(options));
}
