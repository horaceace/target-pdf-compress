export type ToolPageConfig = {
  tool: "compress-pdf" | "merge-pdf" | "pdf-to-jpg" | "jpg-to-pdf";
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
  title: "Compress PDF Online Free, Merge, Split, JPG to PDF",
  description:
    "Compress PDF online free, merge PDF files, split PDF pages, convert PDF to JPG, and turn JPG to PDF in your browser.",
  h1: "Compress PDF Online Free and Convert Document Files Fast",
  subheading:
    "Use free browser-first tools to compress PDF, merge PDF, split PDF, convert PDF to JPG, and convert JPG to PDF for uploads, forms, and sharing.",
  quickLinks: [
    "compress-pdf-online",
    "reduce-pdf-size-online",
    "free-pdf-compressor",
    "compress-pdf-to-500kb",
    "compress-pdf-to-200kb",
    "compress-pdf-to-1mb",
    "compress-pdf-to-2mb",
    "compress-pdf-for-upload",
    "compress-resume-pdf",
    "compress-pdf-for-email",
    "compress-scanned-pdf",
    "compress-pdf-without-losing-readability",
    "compress-pdf-without-losing-quality",
    "reduce-pdf-size-for-job-application",
    "compress-large-pdf",
    "pdf-to-jpg-online",
    "convert-pdf-pages-to-jpg",
    "jpg-to-pdf-online",
    "images-to-pdf-for-upload"
  ],
  useCases: [
    "For form uploads",
    "For resumes and job applications",
    "For email attachments",
    "For turning PDF pages into images",
    "For turning screenshots into one PDF"
  ],
  faq: [
    {
      question: "How do I compress a PDF online for free?",
      answer:
        "Upload your PDF, choose the compression mode that fits the file, and download the smaller result in your browser."
    },
    {
      question: "Can I merge, split, or convert PDFs here too?",
      answer:
        "Yes. FileSmaller includes Compress PDF, Merge PDF, Split PDF, PDF to JPG, and JPG to PDF in one browser-first workflow."
    },
    {
      question: "Can I convert PDF to JPG online for free?",
      answer:
        "Yes. Upload one PDF, render each page in the browser, and download JPG page images individually or as a ZIP file."
    },
    {
      question: "Can I convert JPG to PDF online for free?",
      answer:
        "Yes. Upload JPG or PNG files, reorder them if needed, and export one PDF in the browser."
    },
    {
      question: "Will this always reach the smallest possible PDF size?",
      answer:
        "Not always. Some PDFs can shrink a lot, while image-heavy or scanned files may stay relatively large even after processing."
    },
    {
      question: "Do I need to install software to use these tools?",
      answer:
        "No. The current workflow is browser-first, so the main tools run directly in the browser without a separate desktop install."
    },
    {
      question: "Will compression affect PDF quality?",
      answer:
        "It can. Maximum compression usually trades file size against image quality, so scanned documents and image-based PDFs may lose more detail than text-heavy files."
    }
  ]
};

export const toolPages: ToolPageConfig[] = [
  {
    tool: "compress-pdf",
    slug: "compress-pdf-online",
    title: "Compress PDF Online Free",
    description:
      "Compress PDF online free in your browser. Make large PDF files smaller for upload, email, forms, and document sharing.",
    h1: "Compress PDF Online",
    subheading:
      "Reduce PDF file size online for uploads, email attachments, and everyday document sharing.",
    targetLabel: "Compression mode: online PDF shrinking",
    intro:
      "Use this page when you need a simple online PDF compressor that focuses on making documents smaller for common sharing and upload tasks.",
    steps: [
      "Upload your PDF file",
      "Choose the compression mode that fits your use case",
      "Download the smaller processed PDF"
    ],
    faq: [
      {
        question: "Can I compress a PDF online for free?",
        answer:
          "Yes. This tool lets you upload a PDF in the browser, process it, and download a smaller version without a paid plan."
      },
      {
        question: "What is this online PDF compressor best for?",
        answer:
          "It is best for forms, uploads, email attachments, resumes, and other common document sharing tasks where the file is too large."
      },
      {
        question: "Will this work for all PDFs?",
        answer:
          "It works for many PDFs, but scanned and image-heavy files may not shrink enough with browser-side processing alone."
      },
      {
        question: "Do I need to target an exact PDF size?",
        answer:
          "Usually no. Most users just need the file to become smaller enough to upload, send, or share successfully."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-online",
      "free-pdf-compressor",
      "compress-pdf-for-upload",
      "compress-pdf-for-email"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-online",
    title: "Reduce PDF Size Online Fast",
    description:
      "Reduce PDF size online fast for email, uploads, and document portals. Make PDF files smaller without installing software.",
    h1: "Reduce PDF Size Online",
    subheading:
      "Make PDF files smaller online when you need a faster path to upload or share documents.",
    targetLabel: "Compression mode: smaller online file size",
    intro:
      "This page is for users searching for a quick way to reduce PDF size online before sending a file, submitting a form, or uploading documents.",
    steps: [
      "Upload a PDF from your device",
      "Run compression for a smaller file size",
      "Download the reduced PDF"
    ],
    faq: [
      {
        question: "How do I reduce PDF size online?",
        answer:
          "Upload the file, run compression, and download the smaller version. The final reduction depends on how image-heavy the PDF is."
      },
      {
        question: "Is this better than installing a desktop PDF tool?",
        answer:
          "For simple size reduction, yes. It is faster to use in the browser when you only need a smaller file for one task."
      },
      {
        question: "Will reducing PDF size affect readability?",
        answer:
          "Text-heavy PDFs usually stay readable. Scans and image-based PDFs may lose more detail with stronger compression."
      },
      {
        question: "Can I use this for upload limits and attachments?",
        answer:
          "Yes. That is the main use case for this page."
      }
    ],
    relatedSlugs: [
      "compress-pdf-online",
      "compress-pdf-for-upload",
      "compress-pdf-for-email",
      "compress-pdf-without-losing-readability"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "free-pdf-compressor",
    title: "Free PDF Compressor Online",
    description:
      "Use a free PDF compressor online to reduce large PDF files for uploads, email, resumes, and sharing.",
    h1: "Free PDF Compressor",
    subheading:
      "Compress PDF files online for free when you need a smaller document for forms, email, or uploads.",
    targetLabel: "Compression mode: free PDF compression",
    intro:
      "This page targets users who want a free online PDF compressor without installing software before handling document uploads and attachments.",
    steps: [
      "Upload the PDF you want to shrink",
      "Run the available compression mode",
      "Download the compressed PDF"
    ],
    faq: [
      {
        question: "Is this PDF compressor free?",
        answer:
          "Yes. The current version lets users compress PDF files online without a paid account."
      },
      {
        question: "What types of PDF files can I compress for free?",
        answer:
          "Common office PDFs, resumes, forms, reports, and many other documents can usually be reduced."
      },
      {
        question: "Will free compression work on large scanned PDFs?",
        answer:
          "It may help, but image-heavy scans are the hardest files to shrink and sometimes need stronger server-side compression."
      },
      {
        question: "Is there a limit for basic use?",
        answer:
          "This version is designed as a lightweight free tool for common compression tasks."
      }
    ],
    relatedSlugs: [
      "compress-pdf-online",
      "reduce-pdf-size-online",
      "compress-pdf-for-upload",
      "compress-scanned-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-attachment",
    title: "Reduce PDF Size for Attachment",
    description:
      "Reduce PDF size for attachments before sending documents by email, forms, or messaging apps.",
    h1: "Reduce PDF Size for Attachment",
    subheading:
      "Make PDF attachments smaller before sending resumes, forms, contracts, or reports.",
    targetLabel: "Compression mode: smaller attachment size",
    intro:
      "This page is for users who need to reduce PDF size before attaching a file to email, job portals, or document-sharing workflows.",
    steps: [
      "Upload the PDF you want to attach",
      "Run compression to shrink the attachment size",
      "Download the smaller PDF and send it"
    ],
    faq: [
      {
        question: "Why reduce PDF size for attachments?",
        answer:
          "Attachments often fail because the file is too large. A smaller PDF is easier to send, forward, and store."
      },
      {
        question: "Is this useful for contracts and reports?",
        answer:
          "Yes. Text-heavy office documents often respond well to PDF compression and become easier to attach."
      },
      {
        question: "Will the PDF still open normally after compression?",
        answer:
          "Yes in most cases. The goal is to keep the file usable while making it smaller."
      },
      {
        question: "Can this help with mobile attachments too?",
        answer:
          "Yes. Smaller PDFs are easier to upload and attach from phones as well as desktops."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-email",
      "compress-pdf-to-send-by-email",
      "reduce-pdf-size-for-gmail",
      "compress-pdf-for-upload"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-whatsapp",
    title: "Reduce PDF Size for WhatsApp",
    description:
      "Reduce PDF size for WhatsApp before sharing documents, forms, invoices, and office files on mobile.",
    h1: "Reduce PDF Size for WhatsApp",
    subheading:
      "Make PDFs smaller before sending them through WhatsApp on mobile or desktop.",
    targetLabel: "Compression mode: mobile sharing size",
    intro:
      "Use this page when a PDF feels too heavy to share comfortably through WhatsApp and you want a smaller file for faster sending.",
    steps: [
      "Upload the PDF you want to share",
      "Run compression for a smaller mobile-friendly file",
      "Download the result and send it through WhatsApp"
    ],
    faq: [
      {
        question: "Why reduce PDF size for WhatsApp?",
        answer:
          "Smaller PDFs are easier to send on mobile connections and simpler for the recipient to download."
      },
      {
        question: "Is this good for invoices and forms?",
        answer:
          "Yes. Common office PDFs often shrink enough to become easier to share."
      },
      {
        question: "Will scanned PDFs shrink enough for messaging?",
        answer:
          "Sometimes, but heavy scanned files are harder to compress than text-based documents."
      },
      {
        question: "Can I use this on a phone?",
        answer:
          "Yes. The flow is designed for browser-based sharing tasks."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-attachment",
      "compress-pdf-for-email",
      "compress-scanned-pdf",
      "compress-pdf-online"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-gmail",
    title: "Reduce PDF Size for Gmail",
    description:
      "Reduce PDF size for Gmail attachments before sending documents, resumes, reports, and forms by email.",
    h1: "Reduce PDF Size for Gmail",
    subheading:
      "Make PDF files smaller for Gmail attachments and smoother email sending.",
    targetLabel: "Compression mode: Gmail attachment size",
    intro:
      "This page is meant for people who need to shrink a PDF before attaching it in Gmail, especially when the file is too large to send comfortably.",
    steps: [
      "Upload the PDF you want to send with Gmail",
      "Run compression to reduce the attachment size",
      "Download the smaller file and attach it"
    ],
    faq: [
      {
        question: "Why reduce PDF size for Gmail?",
        answer:
          "Large attachments are harder to send and store. A smaller PDF makes the email workflow simpler."
      },
      {
        question: "Is this good for resumes and job applications?",
        answer:
          "Yes. Resume and application PDFs often need to be smaller before sending through email."
      },
      {
        question: "What if the PDF is still too large after compression?",
        answer:
          "That usually means the file contains many images or scanned pages and may need stronger compression."
      },
      {
        question: "Can I use this for contracts and reports too?",
        answer:
          "Yes. Those are common Gmail attachment use cases."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-email",
      "reduce-pdf-size-for-attachment",
      "compress-pdf-to-send-by-email",
      "compress-resume-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-job-application",
    title: "Reduce PDF Size for Job Application",
    description:
      "Reduce PDF size for job applications before uploading resumes, cover letters, certificates, and supporting documents.",
    h1: "Reduce PDF Size for Job Application",
    subheading:
      "Make application PDFs smaller for ATS systems, hiring portals, and recruiter email submissions.",
    targetLabel: "Compression mode: job application file size",
    intro:
      "Use this page when a hiring system rejects your resume, certificate, or application PDF because the file is too large.",
    steps: [
      "Upload your application PDF",
      "Run compression for a smaller job-ready file",
      "Download the result and resubmit it"
    ],
    faq: [
      {
        question: "Why reduce PDF size for a job application?",
        answer:
          "Many job portals and applicant tracking systems reject files that exceed upload limits."
      },
      {
        question: "Is this only for resumes?",
        answer:
          "No. It is also useful for cover letters, certificates, portfolios, and supporting forms."
      },
      {
        question: "Will the PDF stay readable for recruiters?",
        answer:
          "Usually yes for text-based documents. Scanned certificates may lose more quality under stronger compression."
      },
      {
        question: "Is this better than aiming for one exact file size?",
        answer:
          "Usually yes. Different hiring systems use different limits, so making the file smaller is often the more practical goal."
      }
    ],
    relatedSlugs: [
      "compress-resume-pdf",
      "compress-pdf-for-upload",
      "compress-pdf-without-losing-quality",
      "compress-pdf-online"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-to-send-by-email",
    title: "Compress PDF to Send by Email",
    description:
      "Compress PDF to send by email before attaching documents, reports, forms, or resumes.",
    h1: "Compress PDF to Send by Email",
    subheading:
      "Shrink PDFs before email sending so attachments are easier to deliver and open.",
    targetLabel: "Compression mode: send by email",
    intro:
      "This page is designed for users who need to compress a PDF quickly before sending it by email to a recruiter, client, teammate, or portal.",
    steps: [
      "Upload the PDF you want to email",
      "Compress it for a smaller sendable file",
      "Download the result and attach it"
    ],
    faq: [
      {
        question: "Why compress a PDF before sending by email?",
        answer:
          "Email systems handle smaller attachments more smoothly, especially when the original file contains many pages or images."
      },
      {
        question: "Can I use this for resumes and reports?",
        answer:
          "Yes. Both are common email attachment cases."
      },
      {
        question: "Will the recipient notice a difference?",
        answer:
          "Usually not for text-based PDFs. Stronger compression can affect image-heavy files more visibly."
      },
      {
        question: "Is this the same as a general PDF compressor?",
        answer:
          "The base compression is similar, but this page is positioned around the email sending use case."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-email",
      "reduce-pdf-size-for-attachment",
      "reduce-pdf-size-for-gmail",
      "compress-pdf-online"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-large-pdf",
    title: "Compress Large PDF Online",
    description:
      "Compress large PDF files online for uploads, sharing, attachments, and document portals.",
    h1: "Compress Large PDF",
    subheading:
      "Shrink large PDF files when they are too heavy for uploads, email, or document sharing.",
    targetLabel: "Compression mode: large file reduction",
    intro:
      "Use this page when the starting PDF is already large and you need maximum practical reduction before trying to send or upload it.",
    steps: [
      "Upload the large PDF file",
      "Run strong compression to reduce its size",
      "Download the smaller version"
    ],
    faq: [
      {
        question: "What counts as a large PDF?",
        answer:
          "Usually any file that feels too heavy to upload, email, or share comfortably."
      },
      {
        question: "Why are some PDFs much larger than others?",
        answer:
          "Scans, embedded images, and complex page assets usually make PDFs much larger."
      },
      {
        question: "Can this shrink very large scanned PDFs?",
        answer:
          "Sometimes, but scans are the hardest files to reduce dramatically in the browser."
      },
      {
        question: "Should I use this instead of a readability-focused page?",
        answer:
          "Yes if size reduction is your main goal. Use a quality-focused page when appearance matters more."
      }
    ],
    relatedSlugs: [
      "compress-scanned-pdf",
      "compress-pdf-for-upload",
      "compress-pdf-online",
      "compress-pdf-under-upload-limit"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-under-upload-limit",
    title: "Compress PDF Under Upload Limit",
    description:
      "Compress PDF under upload limits for forms, document portals, visa systems, and application websites.",
    h1: "Compress PDF Under Upload Limit",
    subheading:
      "Make your PDF small enough to pass upload limits on websites, forms, and application portals.",
    targetLabel: "Compression mode: under upload limit",
    intro:
      "This page targets users who do not care about an exact number and only need the PDF to become small enough to upload successfully.",
    steps: [
      "Upload the PDF that is being rejected",
      "Run compression to shrink it under the practical limit",
      "Download the result and try the upload again"
    ],
    faq: [
      {
        question: "Why optimize for upload limit instead of exact size?",
        answer:
          "Because different systems use different limits. The real goal is getting the file accepted."
      },
      {
        question: "Will this help with government and school forms?",
        answer:
          "Yes. Forms and portals are a major reason users need smaller PDFs."
      },
      {
        question: "What if the upload still fails?",
        answer:
          "The portal may have a stricter limit than expected, or the file may be too image-heavy for browser-only compression."
      },
      {
        question: "Is this useful for mobile uploads too?",
        answer:
          "Yes. Upload limits affect both mobile and desktop workflows."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-large-pdf",
      "reduce-pdf-size-for-job-application",
      "compress-scanned-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-to-500kb",
    title: "Compress PDF to 500KB",
    description:
      "Compress PDF to 500KB online for forms, uploads, applications, and attachment limits in your browser.",
    h1: "Compress PDF to 500KB",
    subheading:
      "Reduce a PDF toward 500KB when a form, portal, or attachment workflow needs a much smaller file.",
    targetLabel: "Compression goal: around 500KB",
    intro:
      "Use this page when you need to compress a PDF toward 500KB for uploads, job applications, school forms, or smaller attachment limits.",
    steps: [
      "Upload the PDF you need to shrink",
      "Run a stronger compression path for a smaller result",
      "Download the reduced PDF and check whether it is close enough for the limit"
    ],
    faq: [
      {
        question: "Can I always compress a PDF to 500KB?",
        answer:
          "Not always. Text-heavy PDFs often get closer than scanned or image-heavy files, which are harder to shrink that far."
      },
      {
        question: "What if the PDF is still larger than 500KB?",
        answer:
          "Try a stronger compression path, split the PDF first, or reduce image-heavy content if possible."
      },
      {
        question: "Is 500KB a common upload target?",
        answer:
          "Yes. Many forms and application systems use limits around this range."
      },
      {
        question: "Will compression toward 500KB affect quality?",
        answer:
          "It can. Stronger size reduction usually affects image-heavy pages more than text-based PDFs."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-200kb",
      "compress-pdf-to-1mb",
      "compress-pdf-under-upload-limit",
      "compress-pdf-for-upload"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-to-200kb",
    title: "Compress PDF to 200KB",
    description:
      "Compress PDF to 200KB online for strict upload limits, application forms, and lightweight attachments.",
    h1: "Compress PDF to 200KB",
    subheading:
      "Reduce PDFs toward 200KB when you are dealing with very strict file size limits on forms and portals.",
    targetLabel: "Compression goal: around 200KB",
    intro:
      "This page is for cases where a portal or form has a very small file size allowance and you need to push the PDF much lower than a normal upload-ready size.",
    steps: [
      "Upload the PDF that needs a stricter size cut",
      "Run aggressive compression in the browser",
      "Download the result and test it against the upload limit"
    ],
    faq: [
      {
        question: "Can every PDF be compressed to 200KB?",
        answer:
          "No. That is a very strict target, and many scanned or image-heavy PDFs will struggle to reach it in a browser-only flow."
      },
      {
        question: "What works best for a 200KB target?",
        answer:
          "Shorter text-heavy PDFs usually have a better chance than long scans or PDFs full of images."
      },
      {
        question: "Should I split the PDF before trying 200KB?",
        answer:
          "Yes if you only need part of the document. Splitting first can make a very small target more realistic."
      },
      {
        question: "Will quality drop more at 200KB?",
        answer:
          "Usually yes. Very small targets often require more aggressive trade-offs, especially on scanned pages."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-500kb",
      "compress-pdf-under-upload-limit",
      "make-scanned-pdf-smaller",
      "compress-large-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-to-1mb",
    title: "Compress PDF to 1MB",
    description:
      "Compress PDF to 1MB online for attachments, portal uploads, resumes, and everyday document sharing.",
    h1: "Compress PDF to 1MB",
    subheading:
      "Reduce PDF size toward 1MB for upload-ready files, recruiter emails, and general sharing.",
    targetLabel: "Compression goal: around 1MB",
    intro:
      "Use this page when your PDF only needs a moderate size reduction and a target around 1MB is enough for the upload, email, or sharing task.",
    steps: [
      "Upload the PDF you want near 1MB",
      "Run compression with the right balance of size and readability",
      "Download the smaller PDF and send or upload it"
    ],
    faq: [
      {
        question: "Is 1MB a realistic target for many PDFs?",
        answer:
          "Yes. Many normal office PDFs, resumes, forms, and reports can often get closer to 1MB than to much smaller targets like 200KB."
      },
      {
        question: "Why aim for 1MB?",
        answer:
          "Because it is a practical size for many uploads, email attachments, and document sharing tasks."
      },
      {
        question: "Will a PDF compressed toward 1MB stay readable?",
        answer:
          "Usually yes for text-heavy files. Image-heavy PDFs may still show some quality trade-offs."
      },
      {
        question: "What if the file is already under 1MB?",
        answer:
          "Then you may not need stronger compression unless you want an even smaller file for a stricter limit."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-2mb",
      "compress-pdf-to-500kb",
      "reduce-pdf-size-for-attachment",
      "compress-pdf-for-email"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-to-2mb",
    title: "Compress PDF to 2MB",
    description:
      "Compress PDF to 2MB online for attachments, applications, and upload systems that allow moderate file sizes.",
    h1: "Compress PDF to 2MB",
    subheading:
      "Make a PDF smaller toward 2MB when you need a simpler upload or attachment size target.",
    targetLabel: "Compression goal: around 2MB",
    intro:
      "This page is useful when you only need a moderate reduction and a size around 2MB is enough for the website, form, or document system you are using.",
    steps: [
      "Upload the PDF you need to shrink",
      "Run compression for a more manageable size",
      "Download the reduced file and continue with the upload or attachment"
    ],
    faq: [
      {
        question: "Is 2MB easier to reach than 500KB or 200KB?",
        answer:
          "Yes. A 2MB target is usually more realistic for many office PDFs and lighter scanned documents."
      },
      {
        question: "When is a 2MB target useful?",
        answer:
          "It is useful when an upload system allows a moderate file size but your current PDF is still too large."
      },
      {
        question: "Can I keep better readability at 2MB?",
        answer:
          "Often yes. A less aggressive target like 2MB usually preserves readability better than a very small target."
      },
      {
        question: "Should I still compress if the file is only slightly above 2MB?",
        answer:
          "Yes. A lighter or balanced pass may be enough when the PDF is already close to the target."
      }
    ],
    relatedSlugs: [
      "compress-pdf-to-1mb",
      "compress-large-pdf",
      "compress-pdf-for-upload",
      "reduce-pdf-size-online"
    ]
  },
  {
    tool: "pdf-to-jpg",
    slug: "pdf-to-jpg-online",
    title: "PDF to JPG Online Free",
    description:
      "Convert PDF to JPG online free in your browser. Export one JPG image per PDF page for previews, uploads, and sharing.",
    h1: "PDF to JPG Online",
    subheading:
      "Turn PDF pages into JPG images online for previews, uploads, sharing, and simple page extraction.",
    targetLabel: "Conversion workflow: PDF pages to JPG images",
    intro:
      "Use this page when you need to convert a PDF into JPG images online and download one image per page without installing desktop software.",
    steps: [
      "Upload one PDF file",
      "Choose the JPG output quality that fits your use case",
      "Download each PDF page as a JPG image or a ZIP file"
    ],
    faq: [
      {
        question: "Can I convert PDF to JPG online for free?",
        answer:
          "Yes. Upload a PDF, render its pages in the browser, and download JPG files without a paid plan."
      },
      {
        question: "Does each PDF page become its own JPG file?",
        answer:
          "Yes. Each page is exported as a separate JPG image so you can reuse or upload the exact pages you need."
      },
      {
        question: "What is PDF to JPG best for?",
        answer:
          "It is best for previews, CMS uploads, image sharing, and workflows where a page image is more useful than another PDF."
      },
      {
        question: "Can I download all JPG pages at once?",
        answer:
          "Yes. Multi-page results can be downloaded together as a ZIP file."
      }
    ],
    relatedSlugs: [
      "convert-pdf-pages-to-jpg",
      "extract-images-from-pdf-pages",
      "pdf-page-to-jpg-for-preview",
      "jpg-to-pdf-online"
    ]
  },
  {
    tool: "pdf-to-jpg",
    slug: "convert-pdf-pages-to-jpg",
    title: "Convert PDF Pages to JPG",
    description:
      "Convert PDF pages to JPG images online and export each page as a separate image file for preview and reuse.",
    h1: "Convert PDF Pages to JPG",
    subheading:
      "Export each PDF page as a JPG image when you need page-by-page images instead of another PDF file.",
    targetLabel: "Conversion workflow: page-by-page JPG export",
    intro:
      "This page is for users who want to convert PDF pages into JPG images one page at a time for sharing, design review, or upload workflows.",
    steps: [
      "Upload the PDF whose pages you want as images",
      "Run the PDF to JPG conversion in the browser",
      "Download each converted page image"
    ],
    faq: [
      {
        question: "Why convert PDF pages to JPG?",
        answer:
          "It is useful when a site, app, or teammate needs image files instead of a PDF document."
      },
      {
        question: "Can I use this for page previews?",
        answer:
          "Yes. Page previews are one of the main reasons to export PDF pages as JPG images."
      },
      {
        question: "Will this work for multi-page PDFs?",
        answer:
          "Yes. Each page is exported separately, even when the source PDF has many pages."
      },
      {
        question: "Do I need a separate PDF editor?",
        answer:
          "No. The current conversion flow works directly in the browser."
      }
    ],
    relatedSlugs: [
      "pdf-to-jpg-online",
      "pdf-page-to-jpg-for-preview",
      "extract-images-from-pdf-pages",
      "jpg-to-pdf-online"
    ]
  },
  {
    tool: "pdf-to-jpg",
    slug: "pdf-page-to-jpg-for-preview",
    title: "PDF Page to JPG for Preview",
    description:
      "Convert PDF pages to JPG for preview images before uploading, sharing, or embedding them elsewhere.",
    h1: "PDF Page to JPG for Preview",
    subheading:
      "Make PDF preview images fast by turning each page into a separate JPG file in the browser.",
    targetLabel: "Conversion workflow: preview-ready JPG pages",
    intro:
      "Use this page when you need JPG preview images from a PDF for CMS uploads, asset handoff, approvals, or quick visual review.",
    steps: [
      "Upload the PDF you want to preview",
      "Convert the pages into JPG images",
      "Download the preview-ready images"
    ],
    faq: [
      {
        question: "Is this good for CMS preview images?",
        answer:
          "Yes. It works well when a CMS or content workflow needs page images instead of the original PDF."
      },
      {
        question: "Can I use lower JPG quality for smaller previews?",
        answer:
          "Yes. Lower JPG output modes are useful when the goal is a lighter preview image."
      },
      {
        question: "Does this help with document review?",
        answer:
          "Yes. JPG previews are easier to drop into chats, boards, or review documents than a full PDF."
      },
      {
        question: "Can I still keep the original PDF?",
        answer:
          "Yes. The source PDF stays separate while you download JPG preview copies."
      }
    ],
    relatedSlugs: [
      "pdf-to-jpg-online",
      "convert-pdf-pages-to-jpg",
      "extract-images-from-pdf-pages",
      "images-to-pdf-for-upload"
    ]
  },
  {
    tool: "pdf-to-jpg",
    slug: "extract-images-from-pdf-pages",
    title: "Extract Images From PDF Pages",
    description:
      "Extract images from PDF pages by converting each page into a JPG file online in your browser.",
    h1: "Extract Images From PDF Pages",
    subheading:
      "Turn PDF pages into JPG files when you need reusable images from a document workflow.",
    targetLabel: "Conversion workflow: image extraction from page renders",
    intro:
      "This page is for users who want reusable page images from a PDF for previews, uploads, documentation, or simple visual extraction.",
    steps: [
      "Upload the PDF document",
      "Render the pages as JPG images",
      "Download the exported page images"
    ],
    faq: [
      {
        question: "Does this extract embedded images only?",
        answer:
          "No. The current flow exports full page renders as JPG images, which is often the practical result users need."
      },
      {
        question: "Can I use this for scanned PDFs too?",
        answer:
          "Yes. Scanned PDFs can also be rendered as JPG page images."
      },
      {
        question: "Why export full page images?",
        answer:
          "Because many sharing and preview workflows need a page snapshot rather than the original PDF structure."
      },
      {
        question: "Can I redownload all image pages together?",
        answer:
          "Yes. Multi-page JPG exports can be downloaded in one ZIP file."
      }
    ],
    relatedSlugs: [
      "pdf-to-jpg-online",
      "convert-pdf-pages-to-jpg",
      "pdf-page-to-jpg-for-preview",
      "jpg-to-pdf-online"
    ]
  },
  {
    tool: "jpg-to-pdf",
    slug: "jpg-to-pdf-online",
    title: "JPG to PDF Online Free",
    description:
      "Convert JPG to PDF online free in your browser. Combine multiple JPG or PNG images into one PDF document fast.",
    h1: "JPG to PDF Online",
    subheading:
      "Turn JPG and PNG images into one PDF online for uploads, screenshots, scans, and document sharing.",
    targetLabel: "Conversion workflow: images into one PDF",
    intro:
      "Use this page when you need to convert JPG to PDF online and combine several images into one PDF without installing extra software.",
    steps: [
      "Upload JPG or PNG images",
      "Set the image order and page mode you want",
      "Download one combined PDF document"
    ],
    faq: [
      {
        question: "Can I convert JPG to PDF online for free?",
        answer:
          "Yes. Upload image files in the browser and export one PDF without a paid account."
      },
      {
        question: "Can I combine multiple JPG files into one PDF?",
        answer:
          "Yes. Each image becomes a PDF page in the final output."
      },
      {
        question: "Does this also support PNG files?",
        answer:
          "Yes. The current flow accepts both JPG and PNG images."
      },
      {
        question: "What is JPG to PDF best for?",
        answer:
          "It is useful for screenshots, receipt photos, scanned pages, and image bundles that need to become one PDF."
      }
    ],
    relatedSlugs: [
      "convert-images-to-pdf",
      "images-to-pdf-for-upload",
      "combine-jpg-into-one-pdf",
      "pdf-to-jpg-online"
    ]
  },
  {
    tool: "jpg-to-pdf",
    slug: "convert-images-to-pdf",
    title: "Convert Images to PDF Online",
    description:
      "Convert images to PDF online by combining JPG and PNG files into one PDF document in your browser.",
    h1: "Convert Images to PDF",
    subheading:
      "Make one PDF from multiple image files for uploads, archiving, and document workflows.",
    targetLabel: "Conversion workflow: image files to PDF document",
    intro:
      "This page is for users who want to convert image files into a PDF, especially when several screenshots or scans need to become one shareable document.",
    steps: [
      "Upload the images you want in the PDF",
      "Arrange them in the right order",
      "Export one combined PDF file"
    ],
    faq: [
      {
        question: "Why convert images to PDF?",
        answer:
          "A PDF is easier to upload, send, archive, and keep in one file than a loose image set."
      },
      {
        question: "Can I use screenshots and phone photos?",
        answer:
          "Yes. That is a common use case for image-to-PDF conversion."
      },
      {
        question: "Can I control the order of pages?",
        answer:
          "Yes. You can reorder the uploaded images before exporting the PDF."
      },
      {
        question: "Is this different from JPG to PDF?",
        answer:
          "It uses the same core conversion path, but this page targets broader image-to-PDF search intent."
      }
    ],
    relatedSlugs: [
      "jpg-to-pdf-online",
      "combine-jpg-into-one-pdf",
      "images-to-pdf-for-upload",
      "pdf-to-jpg-online"
    ]
  },
  {
    tool: "jpg-to-pdf",
    slug: "combine-jpg-into-one-pdf",
    title: "Combine JPG Into One PDF",
    description:
      "Combine JPG into one PDF online. Merge multiple JPG files into a single PDF document in your browser.",
    h1: "Combine JPG Into One PDF",
    subheading:
      "Merge multiple JPG images into one PDF file for sharing, upload forms, and document handoff.",
    targetLabel: "Conversion workflow: combine JPG files into one PDF",
    intro:
      "Use this page when you have several JPG files and need one PDF instead of sending or uploading separate images one by one.",
    steps: [
      "Upload the JPG files you want to combine",
      "Set the order of the images",
      "Download the final PDF"
    ],
    faq: [
      {
        question: "Can I combine several JPG files into one PDF?",
        answer:
          "Yes. Multiple JPG files can be merged into one PDF, with one image per page."
      },
      {
        question: "Is this useful for scanned pages?",
        answer:
          "Yes. It is useful when each scanned page exists as a separate JPG file."
      },
      {
        question: "Can I use this for client handoff or forms?",
        answer:
          "Yes. A single PDF is often easier to submit or share than many image files."
      },
      {
        question: "Will PNG images work too?",
        answer:
          "Yes. PNG is also supported in the current browser flow."
      }
    ],
    relatedSlugs: [
      "jpg-to-pdf-online",
      "convert-images-to-pdf",
      "images-to-pdf-for-upload",
      "pdf-page-to-jpg-for-preview"
    ]
  },
  {
    tool: "jpg-to-pdf",
    slug: "images-to-pdf-for-upload",
    title: "Images to PDF for Upload",
    description:
      "Convert images to PDF for upload by combining JPG or PNG files into one upload-ready PDF document.",
    h1: "Images to PDF for Upload",
    subheading:
      "Make one upload-ready PDF from screenshots, receipts, scans, and other image files.",
    targetLabel: "Conversion workflow: upload-ready image bundle to PDF",
    intro:
      "Use this page when a portal, form, or document system wants one PDF file and your source material is still spread across several image files.",
    steps: [
      "Upload the images required for the submission",
      "Arrange them into the correct order",
      "Export one upload-ready PDF"
    ],
    faq: [
      {
        question: "Why convert images to PDF before upload?",
        answer:
          "Many systems accept one PDF more easily than several separate images."
      },
      {
        question: "Is this good for receipts and screenshots?",
        answer:
          "Yes. Receipts, screenshots, scans, and mobile photos are strong image-to-PDF use cases."
      },
      {
        question: "Can I compress the PDF afterward?",
        answer:
          "Yes. If the resulting PDF is still too large, you can run Compress PDF next."
      },
      {
        question: "Can I build one PDF from a phone photo set?",
        answer:
          "Yes. That is one of the main reasons to convert images into one PDF."
      }
    ],
    relatedSlugs: [
      "jpg-to-pdf-online",
      "convert-images-to-pdf",
      "combine-jpg-into-one-pdf",
      "compress-pdf-for-upload"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "make-scanned-pdf-smaller",
    title: "Make Scanned PDF Smaller",
    description:
      "Make scanned PDF smaller online for uploads, attachments, forms, and sharing image-heavy documents.",
    h1: "Make Scanned PDF Smaller",
    subheading:
      "Reduce the size of scanned PDFs when image-heavy files are too large to upload or send.",
    targetLabel: "Compression mode: smaller scanned file",
    intro:
      "This page is for image-heavy scanned PDFs that need to be made smaller before submission, sharing, or storage.",
    steps: [
      "Upload the scanned PDF",
      "Run the strongest available reduction mode",
      "Download the smaller scan"
    ],
    faq: [
      {
        question: "Why are scanned PDFs so large?",
        answer:
          "Scanned pages are essentially images, which makes the file heavier than a text-based PDF."
      },
      {
        question: "Will quality drop when making a scanned PDF smaller?",
        answer:
          "It can. Image-heavy PDFs usually trade more visual detail for size reduction."
      },
      {
        question: "Is this better than a general PDF page for scans?",
        answer:
          "Yes. The wording and intent here focus specifically on scanned documents."
      },
      {
        question: "Can I use this for IDs, forms, and certificates?",
        answer:
          "Yes. Those are common scanned PDF use cases."
      }
    ],
    relatedSlugs: [
      "compress-scanned-pdf",
      "compress-large-pdf",
      "compress-pdf-for-upload",
      "compress-pdf-under-upload-limit"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "best-pdf-compressor-online",
    title: "Best PDF Compressor Online",
    description:
      "Find the best PDF compressor online for uploads, attachments, resumes, and scanned files.",
    h1: "Best PDF Compressor Online",
    subheading:
      "Use a practical online PDF compressor for smaller files, faster sharing, and easier uploads.",
    targetLabel: "Compression mode: practical online compressor",
    intro:
      "This page targets users comparing PDF compression tools and looking for a simple browser-first option built around real upload and sharing scenarios.",
    steps: [
      "Upload the PDF you want to shrink",
      "Choose the compression path that matches your use case",
      "Download the smaller result"
    ],
    faq: [
      {
        question: "What makes a PDF compressor good?",
        answer:
          "A good PDF compressor makes files smaller without making the workflow confusing. It should also match real scenarios like uploads, email, and resumes."
      },
      {
        question: "Is one compression mode enough for every PDF?",
        answer:
          "No. Upload-heavy, resume-safe, and scanned-PDF cases often need different trade-offs."
      },
      {
        question: "Why does this site use scenario pages?",
        answer:
          "Because users usually search based on the problem they need to solve, not just a generic compression label."
      },
      {
        question: "Can this work as a free PDF compressor too?",
        answer:
          "Yes. The current version is a lightweight free browser-based tool."
      }
    ],
    relatedSlugs: [
      "compress-pdf-online",
      "free-pdf-compressor",
      "compress-pdf-for-upload",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-visa-application",
    title: "Reduce PDF Size for Visa Application",
    description:
      "Reduce PDF size for visa applications before uploading passports, forms, statements, and supporting documents.",
    h1: "Reduce PDF Size for Visa Application",
    subheading:
      "Make visa application PDFs smaller for embassy portals, form systems, and document submission sites.",
    targetLabel: "Compression mode: visa application upload size",
    intro:
      "Use this page when a visa portal or immigration form system rejects your PDF because the uploaded document is too large.",
    steps: [
      "Upload the visa-related PDF",
      "Run compression to reduce the file for submission",
      "Download the smaller document and upload it again"
    ],
    faq: [
      {
        question: "Why reduce PDF size for a visa application?",
        answer:
          "Visa and immigration portals often have strict upload limits for bank statements, IDs, forms, and supporting PDFs."
      },
      {
        question: "Can I use this for passports and scanned documents?",
        answer:
          "Yes, but scanned image-heavy files may not shrink as much as text-based PDFs."
      },
      {
        question: "Will the document stay readable after compression?",
        answer:
          "Usually yes, but strong compression on scans may reduce some visual detail."
      },
      {
        question: "Is this better than targeting one exact size?",
        answer:
          "Usually yes. The real goal is getting the document accepted by the upload system."
      }
    ],
    relatedSlugs: [
      "compress-pdf-under-upload-limit",
      "compress-pdf-for-upload",
      "make-scanned-pdf-smaller",
      "compress-large-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "make-pdf-smaller-for-email-attachment",
    title: "Make PDF Smaller for Email Attachment",
    description:
      "Make PDF smaller for email attachments before sending reports, forms, contracts, and application documents.",
    h1: "Make PDF Smaller for Email Attachment",
    subheading:
      "Shrink PDFs before attaching them to email so they are easier to send and receive.",
    targetLabel: "Compression mode: smaller email attachment",
    intro:
      "This page is for users who just need to make a PDF smaller before attaching it in email without overthinking exact file sizes.",
    steps: [
      "Upload the PDF you want to email",
      "Run compression to create a smaller attachment",
      "Download the result and attach it"
    ],
    faq: [
      {
        question: "Why make a PDF smaller for email attachment?",
        answer:
          "Smaller attachments are easier to send, less likely to hit size limits, and simpler for recipients to download."
      },
      {
        question: "Is this useful for office documents?",
        answer:
          "Yes. Contracts, invoices, resumes, and reports are common email PDF use cases."
      },
      {
        question: "Will a smaller attachment still look normal?",
        answer:
          "Usually yes for text-heavy PDFs. Image-heavy files may show more visible compression."
      },
      {
        question: "How is this different from a general PDF compressor?",
        answer:
          "The use case is narrower and focused on email attachment intent."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-email",
      "compress-pdf-to-send-by-email",
      "reduce-pdf-size-for-attachment",
      "reduce-pdf-size-for-gmail"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-for-mobile-upload",
    title: "Compress PDF for Mobile Upload",
    description:
      "Compress PDF for mobile upload before submitting documents on phone-based forms, portals, and application systems.",
    h1: "Compress PDF for Mobile Upload",
    subheading:
      "Make PDFs smaller for mobile uploads on websites, apps, forms, and account portals.",
    targetLabel: "Compression mode: mobile upload",
    intro:
      "Use this page when you are uploading a PDF from your phone and the file is too large for the mobile form or portal to accept comfortably.",
    steps: [
      "Upload the PDF from your phone or browser",
      "Compress it for a smaller mobile-friendly size",
      "Download the result and upload it again"
    ],
    faq: [
      {
        question: "Why compress a PDF for mobile upload?",
        answer:
          "Mobile uploads are more sensitive to file size, slower connections, and stricter form behavior."
      },
      {
        question: "Is this useful for job or school forms on phone?",
        answer:
          "Yes. Mobile submissions are a common reason users need smaller PDFs."
      },
      {
        question: "Will this help with slow mobile networks?",
        answer:
          "Yes. Smaller files upload faster and fail less often."
      },
      {
        question: "Can scanned PDFs still be hard to upload from mobile?",
        answer:
          "Yes. Large scanned files are the hardest category to shrink."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-pdf-under-upload-limit",
      "reduce-pdf-size-for-job-application",
      "make-scanned-pdf-smaller"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "reduce-pdf-size-for-college-form",
    title: "Reduce PDF Size for College Form",
    description:
      "Reduce PDF size for college forms before uploading transcripts, statements, certificates, and application documents.",
    h1: "Reduce PDF Size for College Form",
    subheading:
      "Make PDFs smaller for college application forms, admissions portals, and student document uploads.",
    targetLabel: "Compression mode: college form upload size",
    intro:
      "This page is built for students who need to reduce PDF size before submitting academic documents through college websites and application systems.",
    steps: [
      "Upload the academic PDF",
      "Run compression for a smaller submission file",
      "Download the result and upload it to the form"
    ],
    faq: [
      {
        question: "Why reduce PDF size for a college form?",
        answer:
          "Admissions and student portals often set file size limits for transcripts, certificates, and statements."
      },
      {
        question: "Can I use this for transcripts and recommendation letters?",
        answer:
          "Yes. Those are common college application PDFs."
      },
      {
        question: "Will text stay readable?",
        answer:
          "Usually yes for text-based documents. Scanned certificates may be more sensitive to compression."
      },
      {
        question: "Is this useful for scholarship forms too?",
        answer:
          "Yes. Any academic or student portal with upload limits can fit this use case."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-job-application",
      "compress-pdf-for-upload",
      "compress-pdf-under-upload-limit",
      "compress-pdf-without-losing-quality"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-for-portal-upload",
    title: "Compress PDF for Portal Upload",
    description:
      "Compress PDF for portal upload before submitting documents to dashboards, portals, form systems, and account websites.",
    h1: "Compress PDF for Portal Upload",
    subheading:
      "Shrink PDF files so they are easier to upload to account portals and document submission systems.",
    targetLabel: "Compression mode: portal upload",
    intro:
      "Use this page when a portal upload fails because the PDF is too large and you need a smaller version quickly.",
    steps: [
      "Upload the PDF rejected by the portal",
      "Run compression to create a smaller file",
      "Download it and try the portal upload again"
    ],
    faq: [
      {
        question: "What kinds of portals is this page for?",
        answer:
          "Job portals, school portals, client dashboards, visa systems, insurance forms, and other document upload websites."
      },
      {
        question: "Why is portal upload a separate page?",
        answer:
          "Because many users search for the portal problem directly rather than a generic PDF compression term."
      },
      {
        question: "Will this work for scanned documents too?",
        answer:
          "It can help, but scanned files are still harder to shrink dramatically."
      },
      {
        question: "Is this different from mobile upload?",
        answer:
          "The core compression is similar, but this page is positioned for portal-specific intent."
      }
    ],
    relatedSlugs: [
      "compress-pdf-for-upload",
      "compress-pdf-under-upload-limit",
      "compress-pdf-for-mobile-upload",
      "reduce-pdf-size-for-visa-application"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-attachment-too-large",
    title: "Compress PDF Attachment Too Large",
    description:
      "Compress a PDF when the attachment is too large to send by email, messaging apps, or upload forms.",
    h1: "Compress PDF Attachment Too Large",
    subheading:
      "Shrink PDFs when your attachment is too large to send, upload, or share comfortably.",
    targetLabel: "Compression mode: attachment too large",
    intro:
      "This page is for the exact moment when you try to send a PDF and get blocked because the attachment is too large.",
    steps: [
      "Upload the oversized PDF attachment",
      "Run compression to reduce the file size",
      "Download the smaller file and send it again"
    ],
    faq: [
      {
        question: "What should I do when a PDF attachment is too large?",
        answer:
          "Compress it first so the file becomes easier to send through email, portals, or messaging platforms."
      },
      {
        question: "Is this useful for work documents and resumes?",
        answer:
          "Yes. Many users hit attachment problems with reports, contracts, resumes, and scans."
      },
      {
        question: "Why is this page different from email pages?",
        answer:
          "Because some users search the exact error condition rather than the email channel."
      },
      {
        question: "Can this help if I only need the file slightly smaller?",
        answer:
          "Yes. Even a moderate reduction may be enough to clear the attachment limit."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-attachment",
      "make-pdf-smaller-for-email-attachment",
      "compress-pdf-to-send-by-email",
      "compress-large-pdf"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "make-pdf-smaller-for-application",
    title: "Make PDF Smaller for Application",
    description:
      "Make PDF smaller for applications before uploading forms, resumes, supporting files, and official documents.",
    h1: "Make PDF Smaller for Application",
    subheading:
      "Reduce PDF size for applications that reject files because they are too large.",
    targetLabel: "Compression mode: application upload size",
    intro:
      "Use this page when an application system, portal, or online form requires a smaller PDF before submission.",
    steps: [
      "Upload the PDF required for the application",
      "Run compression to shrink the file",
      "Download the smaller result and submit again"
    ],
    faq: [
      {
        question: "What kinds of applications is this page for?",
        answer:
          "Job applications, school admissions, visa forms, account onboarding, and other document-based submission flows."
      },
      {
        question: "Why make the PDF smaller instead of chasing one exact size?",
        answer:
          "Because most systems only care whether the file is under the limit, not whether it hits a specific number."
      },
      {
        question: "Will the document remain usable?",
        answer:
          "Usually yes, especially for text-based PDFs."
      },
      {
        question: "Is this page good for resumes too?",
        answer:
          "Yes, but resume-specific pages may match that search intent even more closely."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-job-application",
      "reduce-pdf-size-for-college-form",
      "reduce-pdf-size-for-visa-application",
      "compress-pdf-for-upload"
    ]
  },
  {
    tool: "compress-pdf",
    slug: "compress-pdf-for-immigration-form",
    title: "Compress PDF for Immigration Form",
    description:
      "Compress PDF for immigration forms before uploading IDs, statements, application forms, and supporting documents.",
    h1: "Compress PDF for Immigration Form",
    subheading:
      "Make immigration-form PDFs smaller for online submission systems and official document uploads.",
    targetLabel: "Compression mode: immigration form upload size",
    intro:
      "This page is focused on immigration and government-style form submissions where document size limits are often strict.",
    steps: [
      "Upload the immigration PDF",
      "Run compression for a smaller official-use file",
      "Download the result and upload it again"
    ],
    faq: [
      {
        question: "Why compress a PDF for an immigration form?",
        answer:
          "Immigration systems often require smaller uploads for passports, letters, financial proofs, and application forms."
      },
      {
        question: "Can this work for scanned IDs and proofs?",
        answer:
          "Yes, though scanned image-heavy files may be harder to shrink."
      },
      {
        question: "Will the document still be readable for review?",
        answer:
          "Usually yes, but strong compression may reduce some image detail."
      },
      {
        question: "Is this similar to the visa application page?",
        answer:
          "Yes, but it targets a slightly different official-form search intent."
      }
    ],
    relatedSlugs: [
      "reduce-pdf-size-for-visa-application",
      "compress-pdf-under-upload-limit",
      "make-scanned-pdf-smaller",
      "compress-pdf-for-portal-upload"
    ]
  },
  {
    tool: "compress-pdf",
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
    tool: "compress-pdf",
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
    tool: "compress-pdf",
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
    tool: "compress-pdf",
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
    tool: "compress-pdf",
    slug: "compress-pdf-without-losing-quality",
    title: "Compress PDF Without Losing Quality",
    description:
      "Compress PDF without losing quality more than necessary. Reduce PDF size for sharing, uploads, and email while keeping documents usable.",
    h1: "Compress PDF Without Losing Quality",
    subheading:
      "Reduce PDF file size while keeping document quality as high as practical for uploads and sharing.",
    targetLabel: "Compression mode: balanced quality retention",
    intro:
      "This page is for users who want a smaller PDF but do not want to over-compress a file that still needs to look clean in reviews, applications, and office workflows.",
    steps: [
      "Upload the PDF you want to optimize",
      "Run balanced compression with quality in mind",
      "Download the smaller file"
    ],
    faq: [
      {
        question: "Can I compress a PDF without losing quality?",
        answer:
          "No compression is completely lossless in every case, but balanced compression can often reduce file size while keeping the document visually usable."
      },
      {
        question: "Which PDFs respond best to quality-friendly compression?",
        answer:
          "Text-based resumes, reports, contracts, and office documents usually keep quality better than scanned or image-heavy PDFs."
      },
      {
        question: "Should I use this instead of maximum compression?",
        answer:
          "Yes if appearance matters. Maximum compression is better for strict upload limits, while this page is better for cleaner-looking output."
      },
      {
        question: "Is this useful for client-facing documents?",
        answer:
          "Yes. It is a better fit when you need a smaller PDF that still looks professional."
      }
    ],
    relatedSlugs: [
      "compress-pdf-without-losing-readability",
      "compress-resume-pdf",
      "compress-pdf-online",
      "reduce-pdf-size-online"
    ]
  },
  {
    tool: "compress-pdf",
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
      "compress-pdf-without-losing-quality",
      "compress-pdf-for-upload",
      "compress-resume-pdf",
      "compress-pdf-for-email",
      "compress-scanned-pdf"
    ]
  }
];

export const toolPageMap = new Map(toolPages.map((page) => [page.slug, page]));
