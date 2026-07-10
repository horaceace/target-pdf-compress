/**
 * Scenario page quality gate (FS-2) — static content check.
 * Run: node scripts/check-scenario-quality.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  path.join(root, "content/tool-pages.ts"),
  path.join(root, "content/split-pages.ts"),
];

function extractPages(src) {
  const pages = [];
  const blocks = src.split(/\n  \{\n/);
  for (const block of blocks.slice(1)) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const title = block.match(/title:\s*"((?:\\.|[^"\\])*)"/)?.[1] ?? "";
    const intro = block.match(/intro:\s*"((?:\\.|[^"\\])*)"/)?.[1] ?? "";
    const faq = (block.match(/question:/g) || []).length;
    const relatedBlock = block.match(/relatedSlugs:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const related = (relatedBlock.match(/"[^"]+"/g) || []).length;
    pages.push({ slug, title, intro, faq, related });
  }
  return pages;
}

const issues = [];
for (const file of files) {
  const pages = extractPages(readFileSync(file, "utf8"));
  for (const p of pages) {
    const pageIssues = [];
    if (p.title.length < 40 || p.title.length > 70) {
      pageIssues.push(`title_len=${p.title.length}`);
    }
    if (p.faq < 3) pageIssues.push(`faq=${p.faq}`);
    if (p.related < 2) pageIssues.push(`related=${p.related}`);
    if (p.intro.length < 80) pageIssues.push(`intro_short=${p.intro.length}`);
    if (!/browser|device|privacy|local/i.test(p.intro)) {
      pageIssues.push("missing_trust");
    }
    if (pageIssues.length) {
      issues.push({ file: path.basename(file), slug: p.slug, pageIssues });
    }
  }
}

if (issues.length) {
  console.error(`Scenario quality gate FAILED: ${issues.length} pages`);
  for (const i of issues.slice(0, 40)) {
    console.error(`- ${i.file} ${i.slug}: ${i.pageIssues.join(", ")}`);
  }
  process.exitCode = 1;
} else {
  console.log("Scenario quality gate passed for tool-pages + split-pages.");
}
