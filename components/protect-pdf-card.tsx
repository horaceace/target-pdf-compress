"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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

  function setFile(file: File | null) {
    setPdfFile(file);
    setError(null);
    setResult(null);
    if (!file) {
      setPassword("");
      setConfirmPassword("");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) setFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setFile(file);
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

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        {/* Title lives in home switcher under Secure & mark */}
        <div
          className={`upload-dropzone${isDragging ? " upload-dropzone--active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!pdfFile) triggerPicker();
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if ((event.key === "Enter" || event.key === " ") && !pdfFile) {
              event.preventDefault();
              triggerPicker();
            }
          }}
        >
          {pdfFile ? (
            <>
              <strong>{pdfFile.name}</strong>
              <span>
                {formatBytes(pdfFile.size)} · PDF
              </span>
              <small>{t("dropzoneHint")}</small>
            </>
          ) : (
            <>
              <strong>{t("dropzoneTitle")}</strong>
              <span>{t("dropzoneHint")}</span>
            </>
          )}
          <input
            ref={inputRef}
            className="upload-dropzone__input"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
          />
        </div>

        {pdfFile ? (
          <div className="upload-mode">
            <div className="upload-mode__row">
              <label htmlFor="protect-password">{t("passwordLabel")}</label>
              <input
                id="protect-password"
                className="upload-mode__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="protect-confirm">{t("confirmPasswordLabel")}</label>
              <input
                id="protect-confirm"
                className="upload-mode__input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmPasswordPlaceholder")}
              />
            </div>
            <div className="upload-mode__meta">
              <strong>{t("passwordLabel")}</strong>
              <span>{t("passwordHint")}</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="tool-card__error">
            <span>{error}</span>
          </div>
        ) : null}

        {result ? (
          <div className="tool-card__result">
            <p className="tool-card__result-title">{t("resultTitle")}</p>
            <p className="tool-card__result-meta">
              {t("resultPages", { count: result.pageCount })} ·{" "}
              {t("resultSize", {
                original: formatBytes(result.originalBytes),
                output: formatBytes(result.outputBytes)
              })}
            </p>
            <button className="button button--primary" type="button" onClick={downloadResult}>
              {t("downloadButton")}
            </button>
          </div>
        ) : null}

        <div className="upload-actions">
          <button
            type="button"
            className="button button--primary button--wide"
            disabled={!pdfFile || !password || isPending}
            onClick={handleProtect}
          >
            {isPending ? t("processing") : t("protectPdf")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!pdfFile || isPending}
              onClick={() => setFile(null)}
            >
              {t("removeFile")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
