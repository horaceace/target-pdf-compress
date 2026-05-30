import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const fixturesDir = path.join(process.cwd(), "test-fixtures", "pdf-compression");

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
      return NextResponse.json({
        files: files.map((fileName) => ({
          name: fileName,
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
