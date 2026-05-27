export type ToolPageConfig = {
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

export const homepage = {
  title: "Compress PDF to a Specific Size Online",
  description:
    "Compress PDF to 200KB, 500KB, 1MB, and more. Reduce PDF file size online for forms, email attachments, and document uploads.",
  h1: "Compress PDF to a Specific Size",
  subheading:
    "Reduce your PDF to 200KB, 500KB, 1MB, and other target sizes for uploads, forms, and email attachments.",
  quickLinks: [
    "compress-pdf-to-200kb",
    "compress-pdf-to-500kb",
    "compress-pdf-to-1mb",
    "compress-pdf-under-1mb",
    "compress-pdf-without-losing-quality"
  ],
  useCases: ["For form uploads", "For job applications", "For email attachments"],
  faq: [
    {
      question: "How do I compress a PDF to a specific size?",
      answer:
        "Upload your PDF, choose a target size, and start compression. The final result depends on the content and structure of your file."
    },
    {
      question: "Can I compress a PDF to 500KB or 1MB exactly?",
      answer:
        "In many cases you can get very close, but exact output size is not always possible. Scanned files and image-heavy PDFs are usually harder to reduce precisely."
    },
    {
      question: "Will PDF compression reduce quality?",
      answer:
        "Compression may reduce image quality depending on the file. Text-based PDFs usually keep their readability better than scanned or image-based documents."
    },
    {
      question: "Is this tool useful for upload limits?",
      answer:
        "Yes. This tool is designed for common size-restricted scenarios like application forms, portals, and email attachments."
    }
  ]
};

export const toolPages: ToolPageConfig[] = [
  {
    slug: "compress-pdf-to-200kb",
    title: "Compress PDF to 200KB Online Free",
    description:
      "Compress PDF to 200KB online for forms and document uploads. Reduce file size quickly and download the optimized PDF in seconds.",
    h1: "Compress PDF to 200KB Online",
    subheading:
      "Reduce PDF size to around 200KB for forms, applications, and file size limits.",
    targetLabel: "Target size: 200KB",
    intro:
      "Use this page when you need a smaller PDF for strict upload limits. It works best for text-heavy documents and simple PDFs.",
    steps: [
      "Upload your PDF file",
      "Compress toward 200KB",
      "Download the optimized PDF"
    ],
    faq: [
      {
        question: "How can I compress a PDF to 200KB?",
        answer:
          "Upload the file and start compression with a 200KB target. If your PDF contains many images, the result may stay above the target size."
      },
      {
        question: "Why is 200KB hard to reach?",
        answer:
          "A 200KB target is very small. PDFs with scanned pages, photos, or complex layouts often need stronger compression and may still not reach that size."
      },
      {
        question: "Is 200KB good for application forms?",
        answer:
          "Yes. Many portals and forms have strict limits, so 200KB is a common target for resumes, ID scans, and document uploads."
      },
      {
        question: "Will text stay readable after compression?",
        answer:
          "Text-based PDFs usually remain readable. Scanned documents may lose more visual quality because they rely on image compression."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-500kb",
      "compress-pdf-to-1mb",
      "compress-pdf-under-1mb",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    slug: "compress-pdf-to-500kb",
    title: "Compress PDF to 500KB Online Free",
    description:
      "Compress PDF to 500KB online for email attachments, forms, and uploads. Fast PDF size reduction with a simple target-size workflow.",
    h1: "Compress PDF to 500KB Online",
    subheading:
      "Reduce your PDF to around 500KB for file uploads, online forms, and email sharing.",
    targetLabel: "Target size: 500KB",
    intro:
      "This page is useful when your document is slightly too large for upload or email limits and needs a more practical target than extreme compression.",
    steps: [
      "Upload your PDF",
      "Compress toward 500KB",
      "Download the smaller file"
    ],
    faq: [
      {
        question: "How do I compress a PDF to 500KB online?",
        answer:
          "Upload your PDF, choose the 500KB target, and start compression. The final output depends on how much image content is inside the file."
      },
      {
        question: "Why is my PDF still above 500KB?",
        answer:
          "Some PDFs contain high-resolution images or scanned pages that cannot be reduced much further without stronger quality loss."
      },
      {
        question: "Is 500KB a common upload limit?",
        answer:
          "Yes. It is a common target for online forms, email attachments, and document portals that reject larger files."
      },
      {
        question: "Can scanned PDFs be compressed to 500KB?",
        answer:
          "Sometimes, yes. But scanned files are image-heavy, so the result depends on image resolution and page count."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-200kb",
      "compress-pdf-to-1mb",
      "compress-pdf-under-1mb",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    slug: "compress-pdf-to-1mb",
    title: "Compress PDF to 1MB Online Free",
    description:
      "Compress PDF to 1MB online for uploads, forms, and email. Reduce large PDF files to a more manageable size in a few clicks.",
    h1: "Compress PDF to 1MB Online",
    subheading:
      "Reduce PDF size to around 1MB for easier sharing, uploads, and file submission limits.",
    targetLabel: "Target size: 1MB",
    intro:
      "A 1MB target is a common balance between file size and quality, especially for resumes, application documents, and shared PDFs.",
    steps: [
      "Upload your PDF",
      "Compress toward 1MB",
      "Download the optimized version"
    ],
    faq: [
      {
        question: "How can I compress a PDF to 1MB?",
        answer:
          "Upload the file and compress it with a 1MB target. This usually works well for common office documents and mixed text-image PDFs."
      },
      {
        question: "Why choose 1MB instead of 500KB?",
        answer:
          "A 1MB target often keeps more image quality and is easier to reach, especially when the file includes visuals, scans, or charts."
      },
      {
        question: "Will the compressed PDF still look clear?",
        answer:
          "In many cases, yes. A 1MB target is less aggressive than smaller targets, so it often preserves readability and layout better."
      },
      {
        question: "Can I use this for email attachments?",
        answer:
          "Yes. Reducing a PDF to around 1MB makes it easier to send by email or upload to systems with moderate size limits."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-200kb",
      "compress-pdf-to-500kb",
      "compress-pdf-under-1mb",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    slug: "compress-pdf-under-1mb",
    title: "Compress PDF Under 1MB Online",
    description:
      "Compress PDF under 1MB online for upload limits and email attachments. Reduce file size below 1MB with a simple target-based workflow.",
    h1: "Compress PDF Under 1MB",
    subheading:
      "Reduce your PDF below 1MB for uploads, sharing, and document portals with file size limits.",
    targetLabel: "Target size: under 1MB",
    intro:
      "This page is for users who only need the file to stay below a limit, not hit an exact size. That makes it a practical option for many upload scenarios.",
    steps: [
      "Upload your PDF",
      "Compress below 1MB",
      "Download the reduced file"
    ],
    faq: [
      {
        question: "What is the difference between under 1MB and exactly 1MB?",
        answer:
          "Under 1MB means the file only needs to stay below the limit. It does not need to match a precise number, which is often easier to achieve."
      },
      {
        question: "Why is this page useful for uploads?",
        answer:
          "Many systems only care whether your file stays below a maximum size. In that case, an under-1MB target is more practical than an exact target."
      },
      {
        question: "Can a PDF still stay over 1MB after compression?",
        answer:
          "Yes. Very large or image-heavy files may still remain above the limit if they cannot be reduced enough without heavy quality loss."
      },
      {
        question: "Should I use this page or the 1MB page?",
        answer:
          "Use this page if your goal is simply to stay below an upload limit. Use the 1MB page if you want a more specific size target."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-1mb",
      "compress-pdf-to-500kb",
      "compress-pdf-to-200kb",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    slug: "compress-pdf-without-losing-quality",
    title: "Compress PDF Without Losing Quality",
    description:
      "Compress PDF online while keeping readability and layout as clear as possible. Reduce file size for uploads, sharing, and storage.",
    h1: "Compress PDF Without Losing Quality",
    subheading:
      "Reduce PDF file size while preserving readability, layout, and document clarity as much as possible.",
    targetLabel: "Compression goal: smaller size with better clarity",
    intro:
      "This page is designed for users who care more about readable output than hitting a very small target size. It is useful for resumes, reports, and documents with visual detail.",
    steps: [
      "Upload your PDF",
      "Compress with clarity in mind",
      "Download the optimized file"
    ],
    faq: [
      {
        question: "Can I compress a PDF without losing any quality at all?",
        answer:
          "Not always. Most compression involves trade-offs, especially for scanned or image-based PDFs. The goal is to keep the file as clear as possible while reducing size."
      },
      {
        question: "Which PDFs keep quality better after compression?",
        answer:
          "Text-based documents usually compress better. Scanned pages, photos, and graphics-heavy files are more likely to show quality changes."
      },
      {
        question: "Should I use this page or a target-size page?",
        answer:
          "Use this page if clarity matters more than hitting an exact size. Use a target-size page if you need to meet a strict upload limit."
      },
      {
        question: "Is this good for resumes and reports?",
        answer:
          "Yes. It is a useful option when the document needs to stay readable and professional after compression."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-1mb",
      "compress-pdf-to-500kb",
      "compress-pdf-under-1mb",
      "compress-pdf-to-200kb"
    ]
  }
];

export const toolPageMap = new Map(toolPages.map((page) => [page.slug, page]));
