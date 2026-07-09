"use client";

import { ChangeEvent, DragEvent, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatBytes } from "@/lib/pdf/compress";
import {
  addTextWatermark,
  addImageWatermark,
  WatermarkResult
} from "@/lib/pdf/watermark";

type WatermarkError = {
  title: string;
  message: string;
};

export function WatermarkCard() {
  const t = useTranslations("WatermarkCard");
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  // Text options
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [textColor, setTextColor] = useState("#999999");
  // Image options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.2);
  const [imageScale, setImageScale] = useState(0.3);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<WatermarkError | null>(null);
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function triggerPdfPicker() {
    pdfInputRef.current?.click();
  }

  function triggerImagePicker() {
    imageInputRef.current?.click();
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
      setResult(null);
    }
    event.target.value = "";
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError(null);
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

  function hexToRgb(hex: string) {
    const v = parseInt(hex.replace("#", ""), 16);
    return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
  }

  function applyWatermark() {
    if (!pdfFile) return;
    startTransition(async () => {
      try {
        setError(null);
        const pdfBytes = await pdfFile.arrayBuffer();

        let res: WatermarkResult;
        if (watermarkType === "image" && imageFile) {
          const imgBytes = await imageFile.arrayBuffer();
          const imgType = imageFile.type === "image/png" ? "png" : "jpg";
          res = await addImageWatermark(pdfBytes, imgBytes, imgType, {
            opacity: imageOpacity,
            scale: imageScale,
          });
        } else {
          res = await addTextWatermark(pdfBytes, {
            text: watermarkText || t("defaultWatermarkText"),
            fontSize,
            opacity,
            rotation,
            color: hexToRgb(textColor),
          });
        }
        setResult(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError({
          title: t("errors.watermarkFailed"),
          message,
        });
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
        }}
      >
        {t("removeFile")}
      </button>
    </div>
  ) : (
    <button className="dropzone-trigger" type="button" onClick={triggerPdfPicker}>
      <p className="dropzone-title">{t("dropzoneTitle")}</p>
      <p className="dropzone-hint">{t("dropzoneHint")}</p>
    </button>
  );

  return (
    <div className="panel tool-card">
      <div>
        <div className="tool-card__toolbar">
          <label className="watermark-type-select">
            <span className="tool-card__label">{t("watermarkTypeLabel")}</span>
            <select
              value={watermarkType}
              onChange={(e) => setWatermarkType(e.target.value as "text" | "image")}
            >
              <option value="text">{t("watermarkTypeText")}</option>
              <option value="image">{t("watermarkTypeImage")}</option>
            </select>
          </label>
        </div>

        <div
          className={`dropzone ${isDragging ? "dropzone--dragging" : ""} ${pdfFile ? "dropzone--filled" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="dropzone-input"
            onChange={handlePdfChange}
          />
          {dropzoneContent}
        </div>

        {pdfFile && watermarkType === "text" && (
          <div className="watermark-controls">
            <label className="watermark-field">
              <span>{t("watermarkTextLabel")}</span>
              <input
                type="text"
                className="field"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t("defaultWatermarkText")}
              />
            </label>

            <div className="watermark-controls__row">
              <label className="watermark-field watermark-field--sm">
                <span>{t("fontSizeLabel")} ({fontSize}px)</span>
                <input
                  type="range"
                  min={12}
                  max={120}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </label>

              <label className="watermark-field watermark-field--sm">
                <span>{t("opacityLabel")} ({Math.round(opacity * 100)}%)</span>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={Math.round(opacity * 100)}
                  onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                />
              </label>
            </div>

            <div className="watermark-controls__row">
              <label className="watermark-field watermark-field--sm">
                <span>{t("rotationLabel")} ({rotation}°)</span>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
              </label>

              <label className="watermark-field watermark-field--sm">
                <span>{t("colorLabel")}</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="watermark-color-input"
                />
              </label>
            </div>
          </div>
        )}

        {pdfFile && watermarkType === "image" && (
          <div className="watermark-controls">
            <div
              className={`dropzone dropzone--sm ${imageFile ? "dropzone--filled" : ""}`}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="dropzone-input"
                onChange={handleImageChange}
              />
              {imageFile ? (
                <div className="dropzone-uploaded">
                  <p className="dropzone-file-name">{imageFile.name}</p>
                  <button
                    className="button button--outline button--sm"
                    type="button"
                    onClick={() => setImageFile(null)}
                  >
                    {t("removeImage")}
                  </button>
                </div>
              ) : (
                <button className="dropzone-trigger" type="button" onClick={triggerImagePicker}>
                  <p className="dropzone-title">{t("imageDropzoneTitle")}</p>
                  <p className="dropzone-hint">{t("imageDropzoneHint")}</p>
                </button>
              )}
            </div>

            <div className="watermark-controls__row">
              <label className="watermark-field watermark-field--sm">
                <span>{t("imageOpacityLabel")} ({Math.round(imageOpacity * 100)}%)</span>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={Math.round(imageOpacity * 100)}
                  onChange={(e) => setImageOpacity(Number(e.target.value) / 100)}
                />
              </label>

              <label className="watermark-field watermark-field--sm">
                <span>{t("imageScaleLabel")} ({Math.round(imageScale * 100)}%)</span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={Math.round(imageScale * 100)}
                  onChange={(e) => setImageScale(Number(e.target.value) / 100)}
                />
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
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
            disabled={!pdfFile || isPending || (watermarkType === "image" && !imageFile)}
            onClick={applyWatermark}
          >
            {isPending ? t("processing") : t("applyWatermark")}
          </button>
        </div>
      </div>
    </div>
  );
}
