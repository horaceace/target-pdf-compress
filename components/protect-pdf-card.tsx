"use client";

import { ChangeEvent, DragEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import { protectPdf, ProtectResult } from "@/lib/pdf/protect";

export function ProtectPdfCard() {
  const t = useTranslations("ProtectPdfCard");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProtectResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function triggerPicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
      setResult(null);
    }
    event.target.value = "";
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
      setResult(null);
    }
  }

  function handleProtect() {
    if (!pdfFile || !password) return;
    if (password !== confirmPassword) {
      setError(t("errors.passwordsDoNotMatch"));
      return;
    }
    startTransition(async () => {
      try {
        setError(null);
        const pdfBytes = await pdfFile.arrayBuffer();
        const res = await protectPdf(pdfBytes, password);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  function downloadResult() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  const dropzoneContent = pdfFile ? (
    <div className="dropzone-uploaded">
      <p className="dropzone-file-name">{pdfFile.name}</p>
      <p className="dropzone-file-meta">
        <span>{formatBytes(pdfFile.size)}</span>
        <span> · PDF</span>
      </p>
      <button
        className="button button--outline button--sm"
        type="button"
        onClick={() => {
          setPdfFile(null);
          setResult(null);
          setError(null);
          setPassword("");
          setConfirmPassword("");
        }}
      >
        {t("removeFile")}
      </button>
    </div>
  ) : (
    <button className="dropzone-trigger" type="button" onClick={triggerPicker}>
      <p className="dropzone-title">{t("dropzoneTitle")}</p>
      <p className="dropzone-hint">{t("dropzoneHint")}</p>
    </button>
  );

  return (
    <div className="panel tool-card">
      <div>
        <div
          className={`dropzone ${isDragging ? "dropzone--dragging" : ""} ${pdfFile ? "dropzone--filled" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="dropzone-input"
            onChange={handleFileChange}
          />
          {dropzoneContent}
        </div>

        {pdfFile && (
          <div className="tool-card__options" style={{ marginTop: 16 }}>
            <label className="tool-card__label" htmlFor="protect-password">
              {t("passwordLabel")}
            </label>
            <input
              id="protect-password"
              className="tool-card__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
            />
            <label className="tool-card__label" htmlFor="protect-confirm" style={{ marginTop: 12 }}>
              {t("confirmPasswordLabel")}
            </label>
            <input
              id="protect-confirm"
              className="tool-card__input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
            />
            <p className="tool-card__hint">{t("passwordHint")}</p>
          </div>
        )}

        {error && (
          <div className="tool-card__error">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="tool-card__result">
            <p className="tool-card__result-title">{t("resultTitle")}</p>
            <p className="tool-card__result-meta">
              {t("resultPages", { count: result.pageCount })} ·{" "}
              {t("resultSize", {
                original: formatBytes(result.originalBytes),
                output: formatBytes(result.outputBytes),
              })}
            </p>
            <button
              className="button button--primary"
              type="button"
              onClick={downloadResult}
            >
              {t("downloadButton")}
            </button>
          </div>
        )}

        <div className="tool-card__actions">
          <button
            className="button button--primary"
            type="button"
            disabled={!pdfFile || !password || isPending}
            onClick={handleProtect}
          >
            {isPending ? t("processing") : t("protectPdf")}
          </button>
        </div>
      </div>
    </div>
  );
}
