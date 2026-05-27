"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { compressPdfInBrowser, type CompressionResult } from "@/lib/pdf/compress";

type UploadCardProps = {
  heading?: string;
  copy?: string;
  targets?: string[];
  initialTarget?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadCard({
  heading = "Upload your PDF",
  copy = "PDF only. Compression results depend on file content.",
  targets = ["Maximum compression", "Balanced", "Better readability"],
  initialTarget
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "done">("idle");
  const [activeTarget, setActiveTarget] = useState(
    initialTarget ?? targets[0] ?? "Maximum compression"
  );
  const [result, setResult] = useState<CompressionResult | null>(null);

  const helperLabel = useMemo(() => {
    if (selectedFile) {
      return `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
    }

    return "No file selected yet.";
  }, [selectedFile]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setStatus("idle");
      setResult(null);
      setError("Please choose a PDF file.");
      return;
    }

    setSelectedFile(file);
    setStatus("ready");
    setResult(null);
    setError(null);
  };

  const handleCompression = async () => {
    if (!selectedFile) {
      setError("Choose a PDF before starting compression.");
      return;
    }

    setError(null);
    setResult(null);
    setStatus("processing");

    try {
      const compressed = await compressPdfInBrowser(selectedFile, activeTarget);
      setResult(compressed);
      setStatus("done");
    } catch {
      setStatus("ready");
      setError("The PDF could not be processed in the browser. Try another file.");
    }
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const reductionLabel = useMemo(() => {
    if (!result) {
      return null;
    }

    const diff = result.originalBytes - result.compressedBytes;

    if (diff <= 0) {
      return "This file did not shrink after browser-side rewriting.";
    }

    const reductionRatio = ((diff / result.originalBytes) * 100).toFixed(1);
    return `Reduced by ${formatBytes(diff)} (${reductionRatio}%).`;
  }, [result]);

  const resultStatusLabel = useMemo(() => {
    if (!result) {
      return null;
    }

    if (result.compressedBytes < result.originalBytes) {
      return `Compression finished using ${result.modeLabel.toLowerCase()}.`;
    }

    return `Compression finished, but this PDF did not get smaller in ${result.modeLabel.toLowerCase()}.`;
  }, [result]);

  const processingLabel =
    status === "processing" ? `Compressing with ${activeTarget.toLowerCase()}...` : "Compress PDF";

  const readyHint =
    status === "ready" ? "Ready to compress this PDF in the browser." : null;

  const doneHint = status === "done" ? resultStatusLabel : null;

  return (
    <div className="panel hero__tool">
      <p className="tool-box__meta">{copy}</p>
      <div className="dropzone">
        <h3>{heading}</h3>
        <p>
          Pick a PDF, choose a compression mode, and run browser-side compression.
          This version focuses on making the file smaller instead of chasing an exact number.
        </p>

        <input
          ref={inputRef}
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={handleFileChange}
          type="file"
        />

        <div className="button-row">
          <button className="button" onClick={handleOpenPicker} type="button">
            {selectedFile ? "Replace PDF" : "Upload PDF"}
          </button>
          <button
            className="button-secondary"
            disabled={status === "processing"}
            onClick={handleCompression}
            type="button"
          >
            {processingLabel}
          </button>
          {result ? (
            <button className="button-secondary" onClick={handleDownload} type="button">
              Download compressed PDF
            </button>
          ) : null}
        </div>

        <div className="file-meta">
          <strong>File status</strong>
          <span>{helperLabel}</span>
        </div>

        <div className="target-strip">
          {targets.map((target) => (
            <button
              className={`target-chip ${target === activeTarget ? "target-chip--active" : ""}`}
              key={target}
              onClick={() => setActiveTarget(target)}
              type="button"
            >
              {target}
            </button>
          ))}
        </div>

        <div className="status-card">
          <strong>Selected mode</strong>
          <span>{activeTarget}</span>
        </div>

        <div className="status-card">
          <strong>MVP limits</strong>
          <span>
            Browser-side rewriting is live now. Some PDFs shrink well, while
            image-heavy or scanned files may not shrink much without stronger server-side compression.
          </span>
        </div>

        {result ? (
          <div className="result-grid">
            <div className="status-card">
              <strong>Original size</strong>
              <span>{formatBytes(result.originalBytes)}</span>
            </div>
            <div className="status-card">
              <strong>Compressed size</strong>
              <span>{formatBytes(result.compressedBytes)}</span>
            </div>
          </div>
        ) : null}

        {result && reductionLabel ? (
          <p className="status-text">{reductionLabel}</p>
        ) : null}

        {error ? <p className="status-text status-text--error">{error}</p> : null}

        {!error && readyHint ? <p className="status-text">{readyHint}</p> : null}

        {!error && status === "processing" ? (
          <p className="status-text">Processing the PDF locally in your browser.</p>
        ) : null}

        {!error && doneHint ? <p className="status-text">{doneHint}</p> : null}
      </div>
    </div>
  );
}
