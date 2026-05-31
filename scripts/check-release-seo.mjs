import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const robotsPath = path.join(projectRoot, ".next", "server", "app", "robots.txt.body");
const sitemapPath = path.join(projectRoot, ".next", "server", "app", "sitemap.xml.body");

function assertCheck(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const [robots, sitemap] = await Promise.all([
    readFile(robotsPath, "utf8"),
    readFile(sitemapPath, "utf8")
  ]);

  const checks = [
    {
      id: "robots-disallow-dev",
      ok: /Disallow:\s*\/dev\/?/i.test(robots),
      message: "robots.txt must disallow /dev/."
    },
    {
      id: "robots-sitemap-present",
      ok: robots.includes("https://filesmaller.space/sitemap.xml"),
      message: "robots.txt must point to the production sitemap."
    },
    {
      id: "sitemap-no-dev",
      ok: !sitemap.includes("/dev/") && !sitemap.includes("/dev<"),
      message: "sitemap.xml must not include /dev paths."
    },
    {
      id: "sitemap-production-host",
      ok: sitemap.includes("https://filesmaller.space/compress-pdf"),
      message: "sitemap.xml must include production FileSmaller URLs."
    }
  ];

  for (const check of checks) {
    assertCheck(check.ok, `${check.id}: ${check.message}`);
  }

  console.log("Release SEO checks passed.");
  for (const check of checks) {
    console.log(`- ${check.id}`);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
