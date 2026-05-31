import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const fixturesDir = path.join(process.cwd(), "test-fixtures", "pdf-compression");
const notesPath = path.join(fixturesDir, "sample-notes.json");

function fixtureKind(fileName: string) {
  if (fileName.startsWith("real-")) {
    return "real";
  }

  if (fileName.startsWith("sample-")) {
    return "synthetic";
  }

  return "other";
}

async function readNotes() {
  try {
    return JSON.parse(await readFile(notesPath, "utf8")) as {
      importedRealSamples?: Record<string, { note?: string; originalFileName?: string }>;
    };
  } catch {
    return { importedRealSamples: {} };
  }
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const requestedFile = url.searchParams.get("file");

  try {
    const files = (await readdir(fixturesDir))
      .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
      .sort((a, b) => a.localeCompare(b));

    if (!requestedFile) {
      const notes = await readNotes();

      return NextResponse.json({
        files: files.map((fileName) => ({
          name: fileName,
          kind: fixtureKind(fileName),
          note: notes.importedRealSamples?.[fileName]?.note ?? "",
          originalFileName: notes.importedRealSamples?.[fileName]?.originalFileName ?? "",
          url: `/dev/compression-benchmark/fixtures?file=${encodeURIComponent(fileName)}`
        }))
      });
    }

    if (!files.includes(requestedFile)) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    const bytes = await readFile(path.join(fixturesDir, requestedFile));

    return new NextResponse(bytes, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="${requestedFile.replaceAll('"', "")}"`,
        "Content-Type": "application/pdf"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to read PDF fixtures"
      },
      { status: 500 }
    );
  }
}
