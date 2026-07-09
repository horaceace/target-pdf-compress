"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState, useTransition } from "react";
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
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [textColor, setTextColor] = useState("#999999");
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

  function setPdf(file: File | null) {
    setPdfFile(file);
    setError(null);
    setResult(null);
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) setPdf(file);
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

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setPdf(file);
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
            scale: imageScale
          });
        } else {
          res = await addTextWatermark(pdfBytes, {
            text: watermarkText || t("defaultWatermarkText"),
            fontSize,
            opacity,
            rotation,
            color: hexToRgb(textColor)
          });
        }
        setResult(res);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError({
          title: t("errors.watermarkFailed"),
          message
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

  return (
    <aside className="panel upload-card">
      <div className="upload-card__top">
        {/* Title/copy shown by home switcher under Secure & mark */}
        <div className="upload-mode">
          <div className="upload-mode__row">
            <label htmlFor="watermark-type">{t("watermarkTypeLabel")}</label>
            <select
              id="watermark-type"
              value={watermarkType}
              onChange={(e) => setWatermarkType(e.target.value as "text" | "image")}
            >
              <option value="text">{t("watermarkTypeText")}</option>
              <option value="image">{t("watermarkTypeImage")}</option>
            </select>
          </div>
        </div>

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
            if (!pdfFile) triggerPdfPicker();
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if ((event.key === "Enter" || event.key === " ") && !pdfFile) {
              event.preventDefault();
              triggerPdfPicker();
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
            ref={pdfInputRef}
            className="upload-dropzone__input"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handlePdfChange}
          />
        </div>

        {pdfFile && watermarkType === "text" ? (
          <div className="upload-mode">
            <div className="upload-mode__row">
              <label htmlFor="watermark-text">{t("watermarkTextLabel")}</label>
              <input
                id="watermark-text"
                className="upload-mode__input"
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t("defaultWatermarkText")}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="watermark-font-size">
                {t("fontSizeLabel")} ({fontSize}px)
              </label>
              <input
                id="watermark-font-size"
                className="upload-mode__input"
                type="range"
                min={12}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="watermark-opacity">
                {t("opacityLabel")} ({Math.round(opacity * 100)}%)
              </label>
              <input
                id="watermark-opacity"
                className="upload-mode__input"
                type="range"
                min={5}
                max={60}
                value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="watermark-rotation">
                {t("rotationLabel")} ({rotation}°)
              </label>
              <input
                id="watermark-rotation"
                className="upload-mode__input"
                type="range"
                min={-90}
                max={90}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="watermark-color">{t("colorLabel")}</label>
              <input
                id="watermark-color"
                className="upload-mode__input"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {pdfFile && watermarkType === "image" ? (
          <div className="upload-mode">
            <div
              className={`upload-dropzone${imageFile ? " upload-dropzone--active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!imageFile) triggerImagePicker();
              }}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if ((event.key === "Enter" || event.key === " ") && !imageFile) {
                  event.preventDefault();
                  triggerImagePicker();
                }
              }}
            >
              {imageFile ? (
                <>
                  <strong>{imageFile.name}</strong>
                  <span>{t("imageDropzoneHint")}</span>
                </>
              ) : (
                <>
                  <strong>{t("imageDropzoneTitle")}</strong>
                  <span>{t("imageDropzoneHint")}</span>
                </>
              )}
              <input
                ref={imageInputRef}
                className="upload-dropzone__input"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
              />
            </div>
            {imageFile ? (
              <div className="upload-actions__secondary">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setImageFile(null)}
                >
                  {t("removeImage")}
                </button>
              </div>
            ) : null}
            <div className="upload-mode__row">
              <label htmlFor="image-opacity">
                {t("imageOpacityLabel")} ({Math.round(imageOpacity * 100)}%)
              </label>
              <input
                id="image-opacity"
                className="upload-mode__input"
                type="range"
                min={5}
                max={60}
                value={Math.round(imageOpacity * 100)}
                onChange={(e) => setImageOpacity(Number(e.target.value) / 100)}
              />
            </div>
            <div className="upload-mode__row">
              <label htmlFor="image-scale">
                {t("imageScaleLabel")} ({Math.round(imageScale * 100)}%)
              </label>
              <input
                id="image-scale"
                className="upload-mode__input"
                type="range"
                min={10}
                max={80}
                value={Math.round(imageScale * 100)}
                onChange={(e) => setImageScale(Number(e.target.value) / 100)}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="tool-card__error">
            <strong>{error.title}</strong>
            <span>{error.message}</span>
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
            disabled={!pdfFile || isPending || (watermarkType === "image" && !imageFile)}
            onClick={applyWatermark}
          >
            {isPending ? t("processing") : t("applyWatermark")}
          </button>
          <div className="upload-actions__secondary">
            <button
              type="button"
              className="button button--secondary"
              disabled={!pdfFile || isPending}
              onClick={() => {
                setPdf(null);
                setImageFile(null);
              }}
            >
              {t("removeFile")}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
