# report-docx

A Claude **skill** for generating professional Word (`.docx`) reports from one of three structured templates — **coursework/college report**, **work report**, or **general report**.

The skill is built on top of the base `docx` skill for all document mechanics and adds two things:

1. **Clear report template structures** (what sections each report type has).
2. **A mandatory interview phase** — content is collected from the user; the skill never fabricates data.

> The skill's instructions are in English, but the **generated document follows the user's requested language** (cover, headings, body, and labels are all set to the document's target language).

## Structure

```
report-docx/
├── SKILL.md                 # Skill definition: workflow, rules, interview phase
├── references/
│   └── templates.md         # Section outlines for the three report templates
├── scripts/
│   └── build_report.js      # docx-js generator: report-content JSON -> .docx
└── package.json             # depends on `docx`
```

## Usage

```bash
npm install
node scripts/build_report.js content.json output.docx
```

Run the parser self-check:

```bash
node scripts/build_report.js --selftest
```

## `content.json` schema (summary)

```jsonc
{
  "template": "kuliah | kerja | umum",   // informational only; structure follows "sections"
  "options": {
    "toc": true,                  // automatic Table of Contents
    "pageNumbers": true,          // page number in footer (cover excluded)
    "font": "Times New Roman",    // body font
    "fontSize": 12,               // body size (pt)
    "lineSpacing": 1.5,           // body line spacing factor
    "firstLineIndent": true,      // indent first line of body paragraphs
    "headingAlign": "left",       // "left" | "center" for Heading 1
    "labels": { "toc": "Daftar Isi", "figure": "Gambar", "table": "Tabel" }
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

- A4 page, 1-inch margins, title page, optional auto Table of Contents.
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
