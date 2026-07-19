# report-docx

A Claude **skill** for generating professional Word (`.docx`) reports built on the **Indonesian academic report structure** (*laporan akademik / skripsi / tugas akhir / makalah*).

> **Base structure: Indonesian academic report.** The section layout, page setup, and conventions follow the standard Indonesian academic report format — **only the structure is used**; no institution name, faculty, or logo is carried over. This means: A4 paper, Times New Roman 12, line spacing 1.5, justified body, margins **left 4 cm / top·right·bottom 3 cm**, and the fixed **BAB I–V** chapter flow with an automatic *Daftar Isi* and *Daftar Pustaka*.

It offers four template structures — **academic paper / makalah** (the primary, BAB I–V structure), **coursework/college report**, **work report**, and **general report**.

The skill is built on top of the base `docx` skill for all document mechanics and adds two things:

1. **Clear report template structures** (what sections each report type has), anchored on the Indonesian academic layout.
2. **A mandatory interview phase** — content is collected from the user; the skill never fabricates data.

> The skill's instructions are in English, but the **generated document follows the user's requested language** (cover, headings, body, and labels are all set to the document's target language).

## Structure

```
report-docx/
├── SKILL.md                 # Skill definition: workflow, rules, interview phase
├── references/
│   └── templates.md         # Section outlines (incl. the Indonesian academic / makalah structure)
├── scripts/
│   └── build_report.js      # docx-js generator: report-content JSON -> .docx
├── examples/
│   ├── makalah.json         # sample content for a makalah (BAB I–V)
│   └── makalah-contoh.docx  # generated sample, academic margins (L 4cm / T·R·B 3cm)
└── package.json             # depends on `docx`
```

## Usage

```bash
npm install
node scripts/build_report.js content.json output.docx

# build the bundled Indonesian academic sample (makalah):
node scripts/build_report.js examples/makalah.json examples/makalah-contoh.docx
```

Run the parser self-check:

```bash
node scripts/build_report.js --selftest
```

## `content.json` schema (summary)

```jsonc
{
  "template": "makalah | kuliah | kerja | umum", // informational only; structure follows "sections"
  "options": {
    "toc": true,                  // automatic Table of Contents
    "pageNumbers": true,          // page number in footer (cover excluded)
    "font": "Times New Roman",    // body font
    "fontSize": 12,               // body size (pt)
    "lineSpacing": 1.5,           // body line spacing factor
    "firstLineIndent": true,      // indent first line of body paragraphs
    "headingAlign": "left",       // "left" | "center" for Heading 1
    "margins": { "left": 4, "top": 3, "right": 3, "bottom": 3 }, // cm; Indonesian academic default (omit -> 1 inch)
    "labels": { "toc": "DAFTAR ISI", "figure": "Gambar", "table": "Tabel" }
  },
  "cover": {
    "logoPath": "/path/logo.png",            // optional
    "lines": [                               // cover lines top -> bottom
      { "text": "LAB REPORT", "size": 16, "bold": true },
      { "text": "Report Title", "size": 22, "bold": true }
    ]
  },
  "sections": [
    {
      "heading": "CHAPTER I — Introduction",  // optional -> Heading 1
      "blocks": [
        { "type": "subheading", "text": "1.1 Background" },          // Heading 2
        { "type": "subsubheading", "text": "1.1.1 Scope" },          // Heading 3
        { "type": "paragraph", "text": "Supports **bold** and *italic*." },
        { "type": "bullets", "items": ["a", "b"] },
        { "type": "numbered", "items": ["one", "two"] },
        { "type": "table", "caption": "Results", "header": ["A","B"], "rows": [["1","2"]] },
        { "type": "image", "path": "/path/fig.png", "width": 400, "caption": "System diagram" },
        { "type": "pagebreak" }
      ]
    }
  ]
}
```

## Features

- A4 page, title page, optional auto Table of Contents. Configurable margins — defaults to the **Indonesian academic** setup (left 4 cm / top·right·bottom 3 cm) via `options.margins`, or 1 inch when omitted.
- **Indonesian academic BAB I–V structure** (Pendahuluan → Tinjauan Pustaka → Metodologi → Hasil dan Analisis → Kesimpulan dan Saran → Daftar Pustaka) as the primary template.
- Numbered headings (H1–H3), justified paragraphs with configurable line spacing and first-line indent.
- Tables with captions and auto-numbering, repeating header rows.
- Inline figures with captions and auto-numbering.
- Inline `**bold**`, `*italic*`, `***bold italic***`.
- Page numbering in the footer (restarts in the body; cover not counted).
- Language-dependent labels are configurable, so the document can be produced in any language.

## Requirements

- Node.js + the [`docx`](https://www.npmjs.com/package/docx) package.

## License

Proprietary.
