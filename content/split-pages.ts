export type SplitPageConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  subheading: string;
  targetLabel: string;
  intro: string;
  steps: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
};

export const splitToolPages: SplitPageConfig[] = [
  {
    slug: "split-pdf-online",
    title: "Split PDF Online Free",
    description:
      "Split PDF online in your browser. Extract page ranges, create smaller PDF parts, and download them instantly.",
    h1: "Split PDF Online",
    subheading:
      "Break one PDF into smaller files by page range before upload, email, or document sharing.",
    targetLabel: "Split workflow: online PDF page ranges",
    intro:
      "Use this page when you need to split a PDF online and export only the pages you actually need for forms, attachments, or follow-up compression.",
    steps: [
      "Upload one PDF file",
      "Enter page ranges like 1-3, 5, 7-9",
      "Download each split PDF result"
    ],
    faq: [
      {
        question: "Can I split a PDF online for free?",
        answer:
          "Yes. This tool lets you upload one PDF in the browser, define page ranges, and export smaller PDF files without a paid plan."
      },
      {
        question: "What is this split PDF page best for?",
        answer:
          "It is best for extracting just the pages you need before sending, uploading, or compressing a smaller document."
      },
      {
        question: "Can I split one page or multiple ranges?",
        answer:
          "Yes. You can split a single page like 6 or multiple ranges like 1-3, 5, 7-9."
      },
      {
        question: "Does this run in the browser?",
        answer:
          "Yes. The first version is browser-first and does not depend on a server-side split queue."
      }
    ],
    relatedSlugs: [
      "extract-pdf-pages",
      "split-pdf-by-page-ranges",
      "split-large-pdf",
      "split-pdf-for-upload"
    ]
  },
  {
    slug: "extract-pdf-pages",
    title: "Extract PDF Pages Online",
    description:
      "Extract PDF pages online by page range and download smaller PDF files for forms, signatures, and supporting documents.",
    h1: "Extract PDF Pages",
    subheading:
      "Pull out only the pages you need from a larger PDF before sending or uploading the file.",
    targetLabel: "Split workflow: extract selected pages",
    intro:
      "This page is for users who need to extract only specific pages from a larger PDF, such as signature pages, certificates, forms, or selected report sections.",
    steps: [
      "Upload the full PDF",
      "Enter the page or page ranges you want to extract",
      "Download the smaller PDF parts"
    ],
    faq: [
      {
        question: "How do I extract pages from a PDF?",
        answer:
          "Upload the file, enter the page numbers or ranges you want to keep, and export smaller PDF files for those pages."
      },
      {
        question: "Can I extract a signature page only?",
        answer:
          "Yes. This is one of the most common use cases for page-range splitting."
      },
      {
        question: "Can I extract multiple ranges at once?",
        answer:
          "Yes. Use a format like 1-2, 5, 8-10 to create multiple split outputs from one PDF."
      },
      {
        question: "Why extract pages before compression?",
        answer:
          "A smaller page set is often easier to upload and may need less follow-up compression."
      }
    ],
    relatedSlugs: [
      "split-pdf-online",
      "split-pdf-for-upload",
      "split-pdf-by-page-ranges",
      "split-large-pdf"
    ]
  },
  {
    slug: "split-pdf-for-upload",
    title: "Split PDF for Upload",
    description:
      "Split PDF for upload by extracting only the required pages before sending files to forms, portals, and document systems.",
    h1: "Split PDF for Upload",
    subheading:
      "Create smaller upload-ready PDF parts by splitting out just the pages required by the form or portal.",
    targetLabel: "Split workflow: upload-ready page groups",
    intro:
      "Use this page when a portal asks for only part of a document, or when uploading a smaller extracted section is easier than sending the full PDF.",
    steps: [
      "Upload the original PDF",
      "Choose the exact pages required for the upload",
      "Download the smaller split file and submit it"
    ],
    faq: [
      {
        question: "Why split a PDF before upload?",
        answer:
          "Many systems only need a few pages. Extracting those pages creates a smaller file and avoids uploading unnecessary content."
      },
      {
        question: "Is this useful for job portals and forms?",
        answer:
          "Yes. It is useful for job applications, visa forms, claims, and document portals that request only part of a larger file."
      },
      {
        question: "Should I split first or compress first?",
        answer:
          "If you only need part of the document, split first. Then compress the smaller result if file size is still a problem."
      },
      {
        question: "Can I export multiple upload-ready parts?",
        answer:
          "Yes. Enter multiple ranges to generate several separate PDFs from one source file."
      }
    ],
    relatedSlugs: [
      "split-pdf-online",
      "extract-pdf-pages",
      "split-large-pdf",
      "split-pdf-by-page-ranges"
    ]
  },
  {
    slug: "split-pdf-by-page-ranges",
    title: "Split PDF by Page Ranges",
    description:
      "Split PDF by page ranges online. Use formats like 1-3, 5, 7-9 to export separate PDF files from one document.",
    h1: "Split PDF by Page Ranges",
    subheading:
      "Define exact page ranges and turn one PDF into multiple smaller PDF files in the browser.",
    targetLabel: "Split workflow: exact page-range exports",
    intro:
      "This page is for users who want precise control over how a PDF is split, especially when exporting multiple sections from one larger document.",
    steps: [
      "Upload a PDF file",
      "Enter page ranges like 1-3, 5, 7-9",
      "Download a separate PDF for each range"
    ],
    faq: [
      {
        question: "What page range formats can I use?",
        answer:
          "The first version supports single pages like 6 and ranges like 3-5, plus multiple ranges separated by commas."
      },
      {
        question: "Can I create several split files from one PDF?",
        answer:
          "Yes. Each valid page range becomes its own exported PDF file."
      },
      {
        question: "Does this work for large scanned PDFs too?",
        answer:
          "It can split them, but very large scanned PDFs may still be heavy and may need compression after splitting."
      },
      {
        question: "What if my range is invalid?",
        answer:
          "The tool shows a specific error so you can fix the page numbers before exporting."
      }
    ],
    relatedSlugs: [
      "split-pdf-online",
      "extract-pdf-pages",
      "split-pdf-for-upload",
      "split-large-pdf"
    ]
  },
  {
    slug: "split-large-pdf",
    title: "Split Large PDF Online",
    description:
      "Split large PDF files online by extracting smaller sections before upload, email, or follow-up compression.",
    h1: "Split Large PDF",
    subheading:
      "Break one large PDF into smaller parts when the original file is too heavy to send or upload comfortably.",
    targetLabel: "Split workflow: large document into smaller parts",
    intro:
      "Use this page when one PDF feels too large to work with and you need to break it into smaller sections before sending, submitting, or compressing each part.",
    steps: [
      "Upload the large PDF",
      "Select the smaller page groups you want to create",
      "Download each split file for the next step"
    ],
    faq: [
      {
        question: "Why split a large PDF?",
        answer:
          "Splitting a large PDF can make the document easier to upload, easier to send, and easier to compress in smaller parts."
      },
      {
        question: "Should I compress or split first?",
        answer:
          "If you only need part of the PDF, split first. If you need the whole document, compression may be the better first step."
      },
      {
        question: "Can I split a large scanned PDF?",
        answer:
          "Yes. Splitting first is often a good way to reduce the scope of a large scanned file before trying compression."
      },
      {
        question: "Can this create several smaller PDFs from one big file?",
        answer:
          "Yes. Each page range becomes its own output file."
      }
    ],
    relatedSlugs: [
      "split-pdf-online",
      "split-pdf-for-upload",
      "split-pdf-by-page-ranges",
      "extract-pdf-pages"
    ]
  },
  {
    slug: "merge-pdf-for-forms",
    title: "Merge PDF for Forms Online",
    description:
      "Merge PDF for forms by combining application pages, signed documents, and supporting files into one submission-ready PDF.",
    h1: "Merge PDF for Forms",
    subheading:
      "Combine separate PDF pages into one form-ready document before submitting to portals and systems.",
    targetLabel: "Merge workflow: form submission PDF",
    intro:
      "Use this page when you need to combine several PDF form pages or supporting documents into one file for a single form submission.",
    steps: [
      "Upload the PDF pages or documents for the form",
      "Arrange them in submission order",
      "Download the merged form-ready PDF"
    ],
    faq: [
      {
        question: "Can I merge PDF forms with supporting documents?",
        answer:
          "Yes. Combine filled forms, signed pages, and supporting documents into one submission PDF."
      },
      {
        question: "Will form fields still work after merging?",
        answer:
          "Browser-based merging keeps the visual pages but may not preserve interactive form fields."
      },
      {
        question: "Should I merge or compress first for forms?",
        answer:
          "Merge first to get the complete document, then compress if the file is too large for the form upload limit."
      }
    ],
    relatedSlugs: ["merge-pdf-online", "merge-pdf-for-upload", "combine-pdf-files", "merge-multiple-pdf-into-one"]
  },
  {
    slug: "merge-pdf-documents-online",
    title: "Merge PDF Documents Online",
    description:
      "Merge PDF documents online by combining reports, contracts, invoices, and official files into one organized PDF.",
    h1: "Merge PDF Documents",
    subheading:
      "Combine business and official PDF documents into one organized file for sharing or archiving.",
    targetLabel: "Merge workflow: document bundling",
    intro:
      "Use this page when you need to bundle several official PDF documents into one organized file for clients, archives, or submissions.",
    steps: [
      "Upload the PDF documents you want to bundle",
      "Arrange them into a logical document order",
      "Download the bundled PDF"
    ],
    faq: [
      {
        question: "Can I merge business documents into one PDF?",
        answer:
          "Yes. Contracts, reports, invoices, and other official documents can all be merged into one file."
      },
      {
        question: "Will page numbering stay consistent?",
        answer:
          "Pages keep their original content. Use the Page Numbers tool afterward if you need continuous page numbering across the merged document."
      },
      {
        question: "Is this good for client document packages?",
        answer:
          "Yes. Merging documents into one PDF makes client handoffs cleaner and easier to track."
      }
    ],
    relatedSlugs: ["merge-pdf-online", "combine-pdf-files", "pdf-combiner", "merge-pdf-for-email"]
  },
  {
    slug: "merge-scanned-pdf",
    title: "Merge Scanned PDF Files Online",
    description:
      "Merge scanned PDF files online by combining scanned pages, receipts, certificates, and image-based documents into one PDF.",
    h1: "Merge Scanned PDF",
    subheading:
      "Combine scanned pages and image-based PDFs into one document for uploads, forms, and sharing.",
    targetLabel: "Merge workflow: scanned document combining",
    intro:
      "Use this page when your PDFs are scanned or image-based and you need to merge them into one file before uploading or sharing.",
    steps: [
      "Upload the scanned PDF files",
      "Set the merge order for the scanned pages",
      "Download the merged scan"
    ],
    faq: [
      {
        question: "Can I merge scanned PDFs?",
        answer:
          "Yes. Scanned and image-based PDFs merge the same way as text PDFs in the browser."
      },
      {
        question: "Will merging scanned PDFs make the file very large?",
        answer:
          "It can. Scanned files are image-heavy. Use Compress PDF after merging if the combined file is too large."
      },
      {
        question: "Should I compress scanned PDFs before or after merging?",
        answer:
          "Usually after. Merge first to get the complete scanned document, then compress the combined result."
      }
    ],
    relatedSlugs: ["merge-pdf-online", "combine-pdf-files", "compress-scanned-pdf", "merge-pdf-for-upload"]
  }
];

export const splitToolPageMap = new Map(splitToolPages.map((page) => [page.slug, page]));
