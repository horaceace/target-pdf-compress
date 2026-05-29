import JSZip from "jszip";

type ZipItem = {
  fileName: string;
  blob: Blob;
};

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadFilesAsZip(
  zipName: string,
  items: ZipItem[]
) {
  if (!items.length) {
    throw new Error("No files available for ZIP download.");
  }

  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.fileName, item.blob);
  });

  const archive = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  });

  triggerDownload(archive, zipName);
}
