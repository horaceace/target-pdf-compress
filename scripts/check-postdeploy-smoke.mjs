const baseUrl = (process.env.RELEASE_BASE_URL || "https://filesmaller.space").replace(/\/+$/, "");

const checks = [
  {
    id: "home",
    path: "/",
    expectedStatus: 200,
    includes: ["FileSmaller"]
  },
  {
    id: "compress-page",
    path: "/compress-pdf",
    expectedStatus: 200,
    includes: ["Compress PDF"]
  },
  {
    id: "robots",
    path: "/robots.txt",
    expectedStatus: 200,
    includes: ["Disallow: /dev/", "Sitemap: https://filesmaller.space/sitemap.xml"]
  },
  {
    id: "sitemap",
    path: "/sitemap.xml",
    expectedStatus: 200,
    includes: ["https://filesmaller.space/compress-pdf"],
    excludes: ["/dev/"]
  },
  {
    id: "dev-page-not-found",
    path: "/dev/compression-benchmark",
    expectedStatus: 404,
    includes: []
  }
];

async function checkEndpoint(check) {
  const url = `${baseUrl}${check.path}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "FileSmaller release smoke check"
    }
  });
  const body = await response.text();

  if (response.status !== check.expectedStatus) {
    throw new Error(`${check.id}: expected HTTP ${check.expectedStatus}, got ${response.status} for ${url}`);
  }

  for (const text of check.includes ?? []) {
    if (!body.includes(text)) {
      throw new Error(`${check.id}: expected response to include ${JSON.stringify(text)} for ${url}`);
    }
  }

  for (const text of check.excludes ?? []) {
    if (body.includes(text)) {
      throw new Error(`${check.id}: expected response not to include ${JSON.stringify(text)} for ${url}`);
    }
  }

  return {
    id: check.id,
    url,
    status: response.status
  };
}

async function main() {
  console.log(`Postdeploy smoke base URL: ${baseUrl}`);

  for (const check of checks) {
    const result = await checkEndpoint(check);
    console.log(`- ${result.id}: HTTP ${result.status} ${result.url}`);
  }

  console.log("Postdeploy smoke checks passed.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
