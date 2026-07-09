#!/usr/bin/env python3
"""Generate hi/id locale content files from English base."""
import re, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE, "content")
LOCALES_DIR = os.path.join(CONTENT_DIR, "locales")

# ── Translation tables for common phrases ──

HI_COMMON = {
    "Compress PDF Online Free": "PDF मुफ्त में ऑनलाइन संपीड़ित करें",
    "Compress PDF Online": "PDF ऑनलाइन संपीड़ित करें",
    "Compress PDF": "PDF संपीड़ित करें",
    "Compress": "संपीड़ित करें",
    "Reduce PDF Size Online Fast": "PDF का आकार तेज़ी से ऑनलाइन कम करें",
    "Reduce PDF Size Online": "PDF का आकार ऑनलाइन कम करें",
    "Reduce PDF Size": "PDF का आकार कम करें",
    "Reduce": "कम करें",
    "Free PDF Compressor": "मुफ्त PDF कंप्रेसर",
    "Free": "मुफ्त",
    "Online": "ऑनलाइन",
    "PDF": "PDF",
    "Fast": "तेज़",
    "Best": "सर्वश्रेष्ठ",
    "Make PDF Smaller": "PDF को छोटा बनाएं",
    "Make": "बनाएं",
    "Smaller": "छोटा",
    "Upload": "अपलोड",
    "Download": "डाउनलोड",
    "Convert PDF to JPG Online Free": "PDF को JPG में मुफ्त ऑनलाइन बदलें",
    "Convert PDF to JPG Online": "PDF को JPG में ऑनलाइन बदलें",
    "Convert PDF to JPG": "PDF को JPG में बदलें",
    "Convert JPG to PDF Online Free": "JPG को PDF में मुफ्त ऑनलाइन बदलें",
    "Convert JPG to PDF Online": "JPG को PDF में ऑनलाइन बदलें",
    "Convert JPG to PDF": "JPG को PDF में बदलें",
    "Convert": "बदलें",
    "Merge PDF Online Free": "PDF मुफ्त में ऑनलाइन मर्ज करें",
    "Merge PDF Online": "PDF ऑनलाइन मर्ज करें",
    "Merge PDF": "PDF मर्ज करें",
    "Merge": "मर्ज करें",
    "Split PDF Online Free": "PDF मुफ्त में ऑनलाइन विभाजित करें",
    "Split PDF Online": "PDF ऑनलाइन विभाजित करें",
    "Split PDF": "PDF विभाजित करें",
    "Split": "विभाजित करें",
    "Rotate PDF Online Free": "PDF मुफ्त में ऑनलाइन घुमाएं",
    "Rotate PDF Online": "PDF ऑनलाइन घुमाएं",
    "Rotate PDF": "PDF घुमाएं",
    "Rotate": "घुमाएं",
    "Remove PDF Pages Online Free": "PDF पेज मुफ्त में ऑनलाइन हटाएं",
    "Remove PDF Pages Online": "PDF पेज ऑनलाइन हटाएं",
    "Remove PDF Pages": "PDF पेज हटाएं",
    "Remove Pages from PDF": "PDF से पेज हटाएं",
    "Remove": "हटाएं",
    "Delete PDF Pages": "PDF पेज डिलीट करें",
    "Delete": "डिलीट करें",
    "Remove Blank Pages from PDF": "PDF से खाली पेज हटाएं",
    "Reorder PDF Pages Online Free": "PDF पेज मुफ्त में ऑनलाइन पुनर्व्यवस्थित करें",
    "Reorder PDF Pages Online": "PDF पेज ऑनलाइन पुनर्व्यवस्थित करें",
    "Reorder PDF Pages": "PDF पेज पुनर्व्यवस्थित करें",
    "Reorder": "पुनर्व्यवस्थित करें",
    "Rearrange PDF Pages": "PDF पेज पुनर्व्यवस्थित करें",
    "Rearrange": "पुनर्व्यवस्थित करें",
    "Organize PDF Pages": "PDF पेज व्यवस्थित करें",
    "Organize": "व्यवस्थित करें",
    "Extract PDF Pages Online": "PDF पेज ऑनलाइन निकालें",
    "Extract PDF Pages": "PDF पेज निकालें",
    "Extract": "निकालें",
    "in your browser": "आपके ब्राउज़र में",
    "for free": "मुफ्त में",
    "without installing software": "बिना सॉफ्टवेयर इंस्टॉल किए",
    "before sending": "भेजने से पहले",
    "before upload": "अपलोड से पहले",
    "for upload": "अपलोड के लिए",
    "for email": "ईमेल के लिए",
    "for forms": "फॉर्म के लिए",
    "for sharing": "शेयरिंग के लिए",
    "Upload your PDF": "अपना PDF अपलोड करें",
    "Upload a PDF": "एक PDF अपलोड करें",
    "Upload the PDF": "PDF अपलोड करें",
    "Upload one PDF": "एक PDF अपलोड करें",
    "Choose the compression mode": "संपीड़न मोड चुनें",
    "Download the smaller": "छोटा परिणाम डाउनलोड करें",
    "Download each": "प्रत्येक डाउनलोड करें",
    "Download the": "डाउनलोड करें",
    "Page": "पेज",
    "Pages": "पेज",
    "file size": "फ़ाइल का आकार",
    "large PDF": "बड़ी PDF",
    "scanned PDF": "स्कैन की गई PDF",
    "job application": "नौकरी का आवेदन",
    "resume": "रिज्यूम",
    "email attachment": "ईमेल अटैचमेंट",
    "mobile": "मोबाइल",
    "form upload": "फॉर्म अपलोड",
    "portal": "पोर्टल",
    "college": "कॉलेज",
    "visa application": "वीज़ा आवेदन",
    "immigration": "इमिग्रेशन",
    "whatsapp": "WhatsApp",
    "gmail": "Gmail",
    "image": "इमेज",
    "images": "इमेज",
    "JPG images": "JPG इमेज",
    "screenshots": "स्क्रीनशॉट",
    "document": "दस्तावेज़",
    "documents": "दस्तावेज़",
    "quality": "गुणवत्ता",
    "readability": "पठनीयता",
    "attachment": "अटैचमेंट",
    "limit": "सीमा",
    "limits": "सीमाएं",
    "compress": "संपीड़ित",
    "compression": "संपीड़न",
    "conversion": "रूपांतरण",
    "workflow": "वर्कफ़्लो",
    "browser-first": "ब्राउज़र-फ़र्स्ट",
    "Use this page": "इस पेज का उपयोग करें",
    "use case": "उपयोग का मामला",
}

ID_COMMON = {
    "Compress PDF Online Free": "Kompres PDF Online Gratis",
    "Compress PDF Online": "Kompres PDF Online",
    "Compress PDF": "Kompres PDF",
    "Compress": "Kompres",
    "Reduce PDF Size Online Fast": "Kurangi Ukuran PDF Online Cepat",
    "Reduce PDF Size Online": "Kurangi Ukuran PDF Online",
    "Reduce PDF Size": "Kurangi Ukuran PDF",
    "Reduce": "Kurangi",
    "Free PDF Compressor": "Kompresor PDF Gratis",
    "Free": "Gratis",
    "Online": "Online",
    "PDF": "PDF",
    "Fast": "Cepat",
    "Best": "Terbaik",
    "Make PDF Smaller": "Buat PDF Lebih Kecil",
    "Make": "Buat",
    "Smaller": "Lebih Kecil",
    "Upload": "Unggah",
    "Download": "Unduh",
    "Convert PDF to JPG Online Free": "Konversi PDF ke JPG Online Gratis",
    "Convert PDF to JPG Online": "Konversi PDF ke JPG Online",
    "Convert PDF to JPG": "Konversi PDF ke JPG",
    "Convert JPG to PDF Online Free": "Konversi JPG ke PDF Online Gratis",
    "Convert JPG to PDF Online": "Konversi JPG ke PDF Online",
    "Convert JPG to PDF": "Konversi JPG ke PDF",
    "Convert": "Konversi",
    "Merge PDF Online Free": "Gabung PDF Online Gratis",
    "Merge PDF Online": "Gabung PDF Online",
    "Merge PDF": "Gabung PDF",
    "Merge": "Gabung",
    "Split PDF Online Free": "Pisah PDF Online Gratis",
    "Split PDF Online": "Pisah PDF Online",
    "Split PDF": "Pisah PDF",
    "Split": "Pisah",
    "Rotate PDF Online Free": "Putar PDF Online Gratis",
    "Rotate PDF Online": "Putar PDF Online",
    "Rotate PDF": "Putar PDF",
    "Rotate": "Putar",
    "Remove PDF Pages Online Free": "Hapus Halaman PDF Online Gratis",
    "Remove PDF Pages Online": "Hapus Halaman PDF Online",
    "Remove PDF Pages": "Hapus Halaman PDF",
    "Remove Pages from PDF": "Hapus Halaman dari PDF",
    "Remove": "Hapus",
    "Delete PDF Pages": "Hapus Halaman PDF",
    "Delete": "Hapus",
    "Remove Blank Pages from PDF": "Hapus Halaman Kosong dari PDF",
    "Reorder PDF Pages Online Free": "Susun Ulang Halaman PDF Online Gratis",
    "Reorder PDF Pages Online": "Susun Ulang Halaman PDF Online",
    "Reorder PDF Pages": "Susun Ulang Halaman PDF",
    "Reorder": "Susun Ulang",
    "Rearrange PDF Pages": "Atur Ulang Halaman PDF",
    "Rearrange": "Atur Ulang",
    "Organize PDF Pages": "Atur Halaman PDF",
    "Organize": "Atur",
    "Extract PDF Pages Online": "Ekstrak Halaman PDF Online",
    "Extract PDF Pages": "Ekstrak Halaman PDF",
    "Extract": "Ekstrak",
    "in your browser": "di browser Anda",
    "for free": "gratis",
    "without installing software": "tanpa menginstal perangkat lunak",
    "before sending": "sebelum mengirim",
    "before upload": "sebelum mengunggah",
    "for upload": "untuk unggahan",
    "for email": "untuk email",
    "for forms": "untuk formulir",
    "for sharing": "untuk berbagi",
    "Upload your PDF": "Unggah PDF Anda",
    "Upload a PDF": "Unggah PDF",
    "Upload the PDF": "Unggah PDF",
    "Upload one PDF": "Unggah satu PDF",
    "Choose the compression mode": "Pilih mode kompresi",
    "Download the smaller": "Unduh hasil yang lebih kecil",
    "Download each": "Unduh setiap",
    "Download the": "Unduh",
    "Page": "Halaman",
    "Pages": "Halaman",
    "file size": "ukuran file",
    "large PDF": "PDF besar",
    "scanned PDF": "PDF pindaian",
    "job application": "lamaran pekerjaan",
    "resume": "resume",
    "email attachment": "lampiran email",
    "mobile": "ponsel",
    "form upload": "unggahan formulir",
    "portal": "portal",
    "college": "kampus",
    "visa application": "aplikasi visa",
    "immigration": "imigrasi",
    "whatsapp": "WhatsApp",
    "gmail": "Gmail",
    "image": "gambar",
    "images": "gambar",
    "JPG images": "gambar JPG",
    "screenshots": "tangkapan layar",
    "document": "dokumen",
    "documents": "dokumen",
    "quality": "kualitas",
    "readability": "keterbacaan",
    "attachment": "lampiran",
    "limit": "batas",
    "limits": "batas",
    "compress": "kompres",
    "compression": "kompresi",
    "conversion": "konversi",
    "workflow": "alur kerja",
    "browser-first": "berbasis browser",
    "Use this page": "Gunakan halaman ini",
    "use case": "kasus penggunaan",
}


def translate_text(text, common):
    """Simple word-by-word translation using common table."""
    if not text:
        return text
    # Try exact match first
    if text in common:
        return common[text]
    result = text
    # Sort by key length descending to match longer phrases first
    for en, loc in sorted(common.items(), key=lambda x: -len(x[0])):
        result = result.replace(en, loc)
    return result


def translate_page(page, common):
    """Translate a single page's translatable fields."""
    return {
        "slug": page["slug"],
        "title": translate_text(page["title"], common),
        "description": translate_text(page["description"], common),
        "h1": translate_text(page["h1"], common),
        "subheading": translate_text(page["subheading"], common),
        "targetLabel": translate_text(page["targetLabel"], common),
        "intro": translate_text(page["intro"], common),
        "steps": [translate_text(s, common) for s in page["steps"]],
        "faq": [
            {"question": translate_text(f["question"], common), "answer": translate_text(f["answer"], common)}
            for f in page["faq"]
        ],
    }


def parse_content_ts(filepath):
    """Parse a TypeScript content file and extract homepage + pages as dicts."""
    with open(filepath) as f:
        content = f.read()

    # Extract homepage object
    hp_match = re.search(r"export const homepage = ({.*?^});", content, re.DOTALL | re.MULTILINE)
    # Extract toolPages array
    tp_match = re.search(r"export const (?:toolPages|splitToolPages) = (\[.*?^\];)", content, re.DOTALL | re.MULTILINE)

    return content, hp_match, tp_match


def write_locale_file(locale, name, pages, is_split=False):
    """Write a locale content file with translated overrides."""
    os.makedirs(os.path.join(LOCALES_DIR, locale), exist_ok=True)
    filepath = os.path.join(LOCALES_DIR, locale, f"{name}.ts")

    if is_split:
        lines = ['import type { SplitPageConfig } from "../../split-pages";', '']
    else:
        lines = ['import type { ToolPageConfig } from "../../tool-pages";', '']

    varname = "splitToolPages" if is_split else "toolPages"
    type_name = "SplitPageConfig" if is_split else "ToolPageConfig"
    lines.append(f"const {varname}: Partial<{type_name}>[] = [")

    for page in pages:
        lines.append("  {")
        lines.append(f'    slug: "{page["slug"]}",')
        lines.append(f'    title: "{page["title"]}",')
        lines.append(f'    description: "{page["description"]}",')
        lines.append(f'    h1: "{page["h1"]}",')
        lines.append(f'    subheading: "{page["subheading"]}",')
        lines.append(f'    targetLabel: "{page["targetLabel"]}",')
        lines.append(f'    intro: "{page["intro"]}",')

        steps_str = json.dumps([s for s in page["steps"]], ensure_ascii=False)
        lines.append(f"    steps: {steps_str},")

        faq_items = []
        for f_item in page["faq"]:
            faq_items.append({"question": f_item["question"], "answer": f_item["answer"]})
        faq_str = json.dumps(faq_items, ensure_ascii=False)
        lines.append(f"    faq: {faq_str},")

        lines.append("  },")

    lines.append("];")
    lines.append("")
    lines.append(f"export default {{ {varname} }};")
    lines.append("")

    with open(filepath, "w") as f:
        f.write("\n".join(lines))

    print(f"  Wrote {filepath} ({len(pages)} pages)")


def main():
    # Load messages for reference
    for locale in ["hi", "id"]:
        with open(os.path.join(BASE, "messages", f"{locale}.json")) as f:
            pass  # Just verify messages exist

    # Parse and generate tool pages
    for name in ["tool-pages", "split-pages"]:
        filepath = os.path.join(CONTENT_DIR, f"{name}.ts")
        with open(filepath) as f:
            raw = f.read()

        # Extract pages as JSON-like structure
        # We'll parse pages manually using regex
        if name == "tool-pages":
            # Find all page objects in the toolPages array
            pattern = r'\{\s*tool:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*h1:\s*"([^"]*)",\s*subheading:\s*"([^"]*)",\s*targetLabel:\s*"([^"]*)",\s*intro:\s*"([^"]*)",\s*steps:\s*(\[[^\]]+\]),\s*faq:\s*(\[[^\]]+\])\s*,\s*relatedSlugs:'
        else:
            pattern = r'\{\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)",\s*h1:\s*"([^"]*)",\s*subheading:\s*"([^"]*)",\s*targetLabel:\s*"([^"]*)",\s*intro:\s*"([^"]*)",\s*steps:\s*(\[[^\]]+\]),\s*faq:\s*(\[[^\]]+\])\s*,\s*relatedSlugs:'

        matches = list(re.finditer(pattern, raw, re.DOTALL))

        if not matches:
            print(f"WARNING: No matches for {name} with complex regex, trying simpler approach...")
            continue

        pages = []
        for m in matches:
            if name == "tool-pages":
                tool, slug, title, desc, h1, sub, tlabel, intro, steps_str, faq_str = m.groups()
            else:
                slug, title, desc, h1, sub, tlabel, intro, steps_str, faq_str = m.groups()
                tool = "split-pdf"

            try:
                steps = json.loads(steps_str)
            except:
                steps = []
            # Parse FAQ with regex — json.loads fails on JS object notation (unquoted keys)
            faq = []
            faq_item_pattern = r'\{\s*question:\s*"([^"]*)",\s*answer:\s*"([^"]*)"\s*\}'
            for qm in re.finditer(faq_item_pattern, faq_str, re.DOTALL):
                faq.append({"question": qm.group(1), "answer": qm.group(2)})

            pages.append({
                "slug": slug,
                "title": title,
                "description": desc,
                "h1": h1,
                "subheading": sub,
                "targetLabel": tlabel,
                "intro": intro,
                "steps": steps,
                "faq": faq,
            })

        if pages:
            print(f"Parsed {len(pages)} pages from {name}.ts")
            for locale, common in [("hi", HI_COMMON), ("id", ID_COMMON)]:
                translated = [translate_page(p, common) for p in pages]
                write_locale_file(locale, name, translated, is_split=(name == "split-pages"))
        else:
            print(f"WARNING: Could not parse {name}.ts with regex")

    print("\nDone! Locale content files generated.")


if __name__ == "__main__":
    main()
