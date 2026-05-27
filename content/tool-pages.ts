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
  title: "Compress PDF to the Smallest Size Online",
  description:
    "Compress PDF online with maximum size reduction for uploads, forms, and email attachments. Reduce PDF files as much as possible in your browser.",
  h1: "Compress PDF to the Smallest Size",
  subheading:
    "Reduce PDF files as much as possible for uploads, email attachments, resumes, and document portals.",
  quickLinks: [
    "compress-pdf-for-upload",
    "compress-resume-pdf",
    "compress-pdf-for-email",
    "compress-scanned-pdf",
    "compress-pdf-without-losing-readability"
  ],
  useCases: [
    "For form uploads",
    "For resumes and job applications",
    "For email attachments"
  ],
  faq: [
    {
      question: "How do I compress a PDF to the smallest size?",
      answer:
        "Upload your PDF and run the strongest available compression mode. The final result depends on the content of the file, especially images and scanned pages."
    },
    {
      question: "Will this always reach the smallest possible PDF size?",
      answer:
        "Not always. Some PDFs can shrink a lot, while image-heavy or scanned files may stay relatively large even after processing."
    },
    {
      question: "Why is maximum compression more useful than a target size?",
      answer:
        "Most users do not care about hitting an exact number. They want the file to become small enough to upload or share successfully."
    },
    {
      question: "Will compression affect quality?",
      answer:
        "It can. Maximum compression usually trades file size against image quality, so scanned documents and image-based PDFs may lose more detail than text-heavy files."
    }
  ]
};

export const toolPages: ToolPageConfig[] = [
  {
    slug: "compress-pdf-for-upload",
    title: "Compress PDF for Upload Online",
    description:
      "Compress PDF for upload limits, forms, and portals. Reduce PDF size as much as possible before submitting documents online.",
    h1: "Compress PDF for Upload",
    subheading:
      "Shrink your PDF as much as possible for portals, forms, and document upload limits.",
    targetLabel: "Compression mode: maximum size reduction",
    intro:
      "Use this page when your PDF is too large to upload and you want the smallest practical file size instead of aiming for an exact number.",
    steps: [
      "Upload your PDF",
      "Run maximum compression",
      "Download the smallest processed version"
    ],
    faq: [
      {
        question: "Why use maximum compression for uploads?",
        answer:
          "Upload systems usually reject files above a limit. In that situation, reducing the file as much as possible is more useful than targeting a fixed size."
      },
      {
        question: "Will this help with form submissions?",
        answer:
          "Yes. This mode is designed for cases where a form or portal blocks larger PDFs and you need a smaller version quickly."
      },
      {
        question: "What if my file is still too large?",
        answer:
          "That can happen with scanned or image-heavy PDFs. Those files often need stronger server-side compression than browser-side rewriting can provide."
      },
      {
        question: "Is this good for PDF uploads on mobile portals?",
        answer:
          "Yes. Maximum compression is often the fastest way to improve compatibility with mobile and web upload systems."
      }
    ],
    relatedSlugs: [
      "compress-resume-pdf",
      "compress-pdf-for-email",
      "compress-scanned-pdf",
      "compress-pdf-without-losing-readability"
    ]
  },
  {
    slug: "compress-resume-pdf",
    title: "Compress Resume PDF Online",
    description:
      "Compress resume PDF files for job applications and career portals. Reduce file size while keeping the document readable and easy to upload.",
    h1: "Compress Resume PDF",
    subheading:
      "Make your resume PDF smaller for job applications, hiring systems, and document submissions.",
    targetLabel: "Compression mode: smaller resume file",
    intro:
      "Resume PDFs often need to stay small enough for applicant tracking systems while still looking clean and readable after compression.",
    steps: [
      "Upload your resume PDF",
      "Run compression with a smaller-file focus",
      "Download the updated PDF"
    ],
    faq: [
      {
        question: "Is this good for job application portals?",
        answer:
          "Yes. Resume files often hit upload restrictions, and this flow helps reduce file size before submission."
      },
      {
        question: "Will my resume stay readable?",
        answer:
          "Usually yes for text-based resumes. Image-heavy resumes may lose more detail during stronger compression."
      },
      {
        question: "Why compress a resume instead of targeting 200KB?",
        answer:
          "Different hiring systems use different limits. Making the file smaller is often more practical than chasing one number."
      },
      {
        question: "Can this help with scanned certificates too?",
        answer:
          "It can help somewhat, but scanned documents are harder to shrink and may need stronger compression than this browser-first version can provide."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-pdf-for-email",
      "compress-scanned-pdf",
      "compress-pdf-without-losing-readability"
    ]
  },
  {
    slug: "compress-pdf-for-email",
    title: "Compress PDF for Email Online",
    description:
      "Compress PDF files for email attachments. Reduce large PDFs before sending documents, contracts, reports, or resumes by email.",
    h1: "Compress PDF for Email",
    subheading:
      "Make PDF attachments smaller for easier email sharing and fewer attachment issues.",
    targetLabel: "Compression mode: email-friendly file size",
    intro:
      "Email attachments often fail because PDF files are too large. This page focuses on making the file smaller enough for easier sending and sharing.",
    steps: [
      "Upload your PDF attachment",
      "Run compression for a smaller file",
      "Download and send the result"
    ],
    faq: [
      {
        question: "Why compress PDFs for email?",
        answer:
          "Large attachments can fail to send or trigger limits. A smaller PDF is easier to attach, forward, and store."
      },
      {
        question: "Will this help with report and contract PDFs?",
        answer:
          "Yes. Text-heavy reports and contracts usually respond well to basic PDF rewriting and compression."
      },
      {
        question: "What if the email attachment is still too large?",
        answer:
          "That usually means the file contains many images or scanned pages. Those files may need stronger compression than this MVP currently provides."
      },
      {
        question: "Can I use this for invoices and forms?",
        answer:
          "Yes. It works well for common office PDFs that need a smaller attachment size."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-resume-pdf",
      "compress-scanned-pdf",
      "compress-pdf-without-losing-readability"
    ]
  },
  {
    slug: "compress-scanned-pdf",
    title: "Compress Scanned PDF Online",
    description:
      "Compress scanned PDF files online. Reduce file size for scanned documents, image-based forms, and uploaded PDF scans.",
    h1: "Compress Scanned PDF",
    subheading:
      "Reduce the size of scanned PDF files for uploads, forms, and sharing.",
    targetLabel: "Compression mode: aggressive for scanned files",
    intro:
      "Scanned PDFs are usually much larger than text-based files because they are image-heavy. This page focuses on shrinking scanned documents as much as possible.",
    steps: [
      "Upload your scanned PDF",
      "Run the strongest available compression",
      "Download the processed file"
    ],
    faq: [
      {
        question: "Why are scanned PDFs harder to compress?",
        answer:
          "Scanned PDFs are mostly images, and image-heavy pages usually stay much larger than text-based documents."
      },
      {
        question: "Will quality drop on scanned PDFs?",
        answer:
          "It can. Maximum compression for scanned files often reduces image detail more than it would for a regular document."
      },
      {
        question: "Can this make a large scan uploadable?",
        answer:
          "Sometimes yes, but not always. Very large scans may still need stronger server-side compression to become small enough."
      },
      {
        question: "Is this better than a fixed target size page?",
        answer:
          "Yes. For scanned files, the important question is usually how much the file can shrink at all, not whether it lands on one exact number."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-resume-pdf",
      "compress-pdf-for-email",
      "compress-pdf-without-losing-readability"
    ]
  },
  {
    slug: "compress-pdf-without-losing-readability",
    title: "Compress PDF Without Losing Readability",
    description:
      "Compress PDF files while keeping the document readable. Reduce file size for uploads and sharing without making the file hard to use.",
    h1: "Compress PDF Without Losing Readability",
    subheading:
      "Make your PDF smaller while keeping the text, layout, and document content usable.",
    targetLabel: "Compression mode: balanced readability",
    intro:
      "This page is for documents where readability matters more than extreme size reduction. It is useful for resumes, reports, and office documents that still need to look clean.",
    steps: [
      "Upload your PDF",
      "Run balanced compression",
      "Download the smaller readable file"
    ],
    faq: [
      {
        question: "What does readable compression mean?",
        answer:
          "It means reducing file size without pushing the document so far that text, layout, or page clarity become hard to use."
      },
      {
        question: "Is this better for resumes and reports?",
        answer:
          "Yes. Those documents usually need to stay clean and legible, so balanced compression is a better fit than aggressive shrinking."
      },
      {
        question: "Why not always use maximum compression?",
        answer:
          "Maximum compression can reduce image quality or visual clarity more aggressively. That is not always the best trade-off."
      },
      {
        question: "Can I still use this for uploads?",
        answer:
          "Yes. This mode is useful when the file needs to be smaller but still look professional and readable."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-resume-pdf",
      "compress-pdf-for-email",
      "compress-scanned-pdf"
    ]
  }
];

export const toolPageMap = new Map(toolPages.map((page) => [page.slug, page]));
