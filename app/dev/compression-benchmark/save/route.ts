import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const resultsDir = path.join(process.cwd(), "test-fixtures", "pdf-compression", "results");

function safeFilePart(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "suite"
  );
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as {
      markdown?: string;
      json?: unknown;
      filePart?: string;
    };

    if (!body.markdown || typeof body.markdown !== "string") {
      return NextResponse.json({ error: "Missing suite Markdown" }, { status: 400 });
    }

    if (!body.json || typeof body.json !== "object") {
      return NextResponse.json({ error: "Missing suite JSON" }, { status: 400 });
    }

    await mkdir(resultsDir, { recursive: true });

    const datePart = new Date().toISOString().slice(0, 10);
    const filePart = safeFilePart(body.filePart ?? datePart);
    const markdownPath = path.join(resultsDir, `browser-compression-benchmark-suite-${filePart}.md`);
    const jsonPath = path.join(resultsDir, `browser-compression-benchmark-suite-${filePart}.json`);

    await writeFile(markdownPath, body.markdown);
    await writeFile(jsonPath, `${JSON.stringify(body.json, null, 2)}\n`);

    return NextResponse.json({
      ok: true,
      markdownPath: path.relative(process.cwd(), markdownPath),
      jsonPath: path.relative(process.cwd(), jsonPath)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save benchmark suite"
      },
      { status: 500 }
    );
  }
}
