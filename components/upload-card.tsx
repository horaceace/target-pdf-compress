type UploadCardProps = {
  heading?: string;
  copy?: string;
  targets?: string[];
};

export function UploadCard({
  heading = "Upload your PDF",
  copy = "PDF only. Compression results depend on file content.",
  targets = ["200KB", "500KB", "1MB", "Under 1MB"]
}: UploadCardProps) {
  return (
    <div className="panel hero__tool">
      <p className="tool-box__meta">{copy}</p>
      <div className="dropzone">
        <h3>{heading}</h3>
        <p>
          This is the first-pass UI shell. Compression logic and file handling will
          plug in here next.
        </p>
        <div className="button-row">
          <button className="button" type="button">
            Upload PDF
          </button>
          <button className="button-secondary" type="button">
            See target sizes
          </button>
        </div>
        <div className="target-strip">
          {targets.map((target) => (
            <span className="target-chip" key={target}>
              {target}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
