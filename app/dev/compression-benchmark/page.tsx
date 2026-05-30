import { notFound } from "next/navigation";
import { CompressionBenchmarkCard } from "@/components/compression-benchmark-card";

export const metadata = {
  title: "Compression Benchmark | FileSmaller Dev",
  robots: {
    index: false,
    follow: false
  }
};

export default function CompressionBenchmarkPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="dev-benchmark">
      <section className="dev-benchmark__shell">
        <div className="section-heading">
          <span className="eyebrow">Local development only</span>
          <h1>PDF compression benchmark</h1>
          <p>
            Upload a local PDF fixture and run the browser compression path across modes. This
            page is disabled in production builds.
          </p>
        </div>
        <CompressionBenchmarkCard />
      </section>
    </main>
  );
}
