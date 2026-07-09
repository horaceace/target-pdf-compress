import { PDFDocument } from "pdf-lib";

export const ENCRYPTED_PASSWORD_REQUIRED = "ENCRYPTED_PDF_PASSWORD_REQUIRED";
export const ENCRYPTED_OR_RESTRICTED = "ENCRYPTED_OR_RESTRICTED_PDF";

function isEncryptionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowered = message.toLowerCase();
  return (
    lowered.includes("password") ||
    lowered.includes("encrypt") ||
    lowered.includes("encrypted")
  );
}

/**
 * Load a PDF for tools that must not silently strip protection (compress/merge/etc).
 * Fails closed when a user/open password is required.
 */
export async function loadPdfStrict(
  bytes: Uint8Array,
  options?: { updateMetadata?: boolean }
) {
  try {
    // Normal open only — never ignoreEncryption here (avoids silent restriction stripping).
    return await PDFDocument.load(bytes, {
      updateMetadata: options?.updateMetadata ?? false
    });
  } catch (error) {
    if (isEncryptionError(error)) {
      throw new Error(ENCRYPTED_PASSWORD_REQUIRED);
    }
    throw error;
  }
}

export type UnlockLoadResult =
  | { kind: "plain"; doc: PDFDocument }
  | { kind: "restrictions-removed"; doc: PDFDocument }
  | { kind: "password-required" };

/**
 * Unlock tool only:
 * - plain PDF → return as-is path
 * - owner restrictions that open without a password → try ignoreEncryption rebuild
 * - true open-password PDFs → password-required (we do not crack/ask password yet)
 */
export async function loadPdfForUnlock(bytes: Uint8Array): Promise<UnlockLoadResult> {
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    if (!doc.isEncrypted) {
      return { kind: "plain", doc };
    }
  } catch (error) {
    if (!isEncryptionError(error)) {
      throw error;
    }
    // Fall through to ignoreEncryption attempt
  }

  try {
    const doc = await PDFDocument.load(bytes, {
      updateMetadata: false,
      ignoreEncryption: true
    });
    // If we can load only with ignoreEncryption, treat as restriction strip (not a known user password).
    return { kind: "restrictions-removed", doc };
  } catch {
    return { kind: "password-required" };
  }
}

export function encryptionErrorMessage(code: string) {
  if (code === ENCRYPTED_PASSWORD_REQUIRED) {
    return "This PDF is password-protected. Browser tools cannot open it without the password.";
  }
  if (code === ENCRYPTED_OR_RESTRICTED) {
    return "This PDF has encryption or restrictions that block browser processing.";
  }
  return code;
}
