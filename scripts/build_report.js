/**
 * build_report.js — Generate a .docx report from a report-content JSON file.
 * Built on top of docx-js, following the conventions of the base skill
 * /mnt/skills/public/docx/SKILL.md (A4, 1" margins, overridden headings,
 * dual-width tables, lists via LevelFormat).
 *
 * Usage:   node scripts/build_report.js content.json output.docx
 * Selftest: node scripts/build_report.js --selftest   (checks inline parser)
 *
 * NOTE: the script never invents content. Whatever is in the JSON is what gets
 * rendered. Document-facing text (cover lines, headings, body) is in whatever
 * language the user asked for; only the few label defaults below are language
 * dependent and overridable via options.labels.
 *
 * content.json SCHEMA:
 * {
 *   "template": "kuliah" | "kerja" | "umum",   // informational only; structure follows "sections"
 *   "options": {
 *     "toc": true,                  // insert an auto Table of Contents
 *     "pageNumbers": true,          // page number in footer (cover excluded)
 *     "font": "Times New Roman",    // body font (default: Times New Roman)
 *     "fontSize": 12,               // body size in pt (default: 12)
 *     "lineSpacing": 1.5,           // body line spacing factor (default: 1.5)
 *     "firstLineIndent": true,      // indent first line of body paragraphs (default: true)
 *     "headingAlign": "left",       // "left" | "center" for Heading 1 (default: left)
 *     "labels": {                   // language-dependent labels (match the document's language)
 *       "toc": "Daftar Isi",
 *       "figure": "Gambar",
 *       "table": "Tabel"
 *     }
 *   },
 *   "cover": {
 *     "logoPath": "/path/logo.png",            // optional
 *     "lines": [                                // cover lines top -> bottom, all from the user
 *       { "text": "LAPORAN PRAKTIKUM", "size": 16, "bold": true },
 *       { "text": "Report Title", "size": 22, "bold": true },
 *       { "text": "By: Name (ID)", "size": 12 }
 *     ]
 *   },
 *   "sections": [                               // chapter/section order, all content from the user
 *     {
 *       "heading": "CHAPTER I — Introduction",  // optional; if present -> Heading 1
 *       "blocks": [
 *         { "type": "subheading", "text": "1.1 Background" },           // Heading 2
 *         { "type": "subsubheading", "text": "1.1.1 Scope" },          // Heading 3
 *         { "type": "paragraph", "text": "Supports **bold** and *italic*." },
 *         { "type": "bullets", "items": ["a", "b"] },
 *         { "type": "numbered", "items": ["one", "two"] },
 *         { "type": "table", "caption": "Test results", "header": ["Col1","Col2"], "rows": [["x","y"]] },
 *         { "type": "image", "path": "/path/fig.png", "width": 400, "caption": "System diagram" },
 *         { "type": "pagebreak" }
 *       ]
 *     }
 *   ]
 * }
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TableOfContents, ImageRun,
  VerticalAlign,
} = require("docx");

const A4 = { width: 11906, height: 16838 };
const CM = 566.93; // twips per cm
let MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
let CONTENT_W = A4.width - MARGIN.left - MARGIN.right; // 9026 twips

/**
 * Parse a tiny subset of inline markdown into TextRuns: **bold**, *italic*,
 * ***bold italic***. Falls back to a single plain run.
 */
function parseInline(text, base = {}) {
  const s = String(text);
  const runs = [];
  const re = /(\*\*\*|\*\*|\*)(.+?)\1/g;
  let last = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: s.slice(last, m.index), ...base }));
    const opts = { ...base };
    if (m[1] === "***") { opts.bold = true; opts.italics = true; }
    else if (m[1] === "**") opts.bold = true;
    else opts.italics = true;
    runs.push(new TextRun({ text: m[2], ...opts }));
    last = re.lastIndex;
  }
  if (last < s.length) runs.push(new TextRun({ text: s.slice(last), ...base }));
  return runs.length ? runs : [new TextRun({ text: s, ...base })];
}

// ---- selftest ----
if (process.argv.includes("--selftest")) {
  const plain = parseInline("hello");
  console.assert(plain.length === 1, "plain -> 1 run");
  const mixed = parseInline("a **b** c *d* ***e***");
  // segments: "a ", "b", " c ", "d", " ", "e"
  console.assert(mixed.length === 6, `mixed -> 6 runs, got ${mixed.length}`);
  console.log("selftest OK");
  process.exit(0);
}

const [, , contentPath, outPath] = process.argv;
if (!contentPath || !outPath) {
  console.error("Usage: node build_report.js content.json output.docx");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const opt = data.options || {};

const FONT = opt.font || "Times New Roman";
const SIZE = (opt.fontSize || 12) * 2;                 // half-points
const LINE = Math.round(240 * (opt.lineSpacing || 1.5)); // twips, 240 = single
const FIRST_INDENT = opt.firstLineIndent !== false ? 720 : 0;
const HEAD_ALIGN = opt.headingAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;
const L = Object.assign({ toc: "Daftar Isi", figure: "Gambar", table: "Tabel" }, opt.labels || {});

// Page margins: opt.margins given in cm, else 1-inch default.
// Indonesian academic default: { left: 4, top: 3, right: 3, bottom: 3 }.
if (opt.margins) {
  const m = opt.margins;
  MARGIN = {
    top: Math.round((m.top ?? 2.54) * CM),
    right: Math.round((m.right ?? 2.54) * CM),
    bottom: Math.round((m.bottom ?? 2.54) * CM),
    left: Math.round((m.left ?? 2.54) * CM),
  };
  CONTENT_W = A4.width - MARGIN.left - MARGIN.right;
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

let figureCount = 0;
let tableCount = 0;

function captionPara(label, n, text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200 },
    children: parseInline(`${label} ${n}. ${text}`, { italics: true, size: SIZE - 2 }),
  });
}

function tableBlock(b) {
  const cols = (b.header && b.header.length) || (b.rows[0] || []).length || 1;
  const colW = Math.floor(CONTENT_W / cols);
  const widths = Array(cols).fill(colW);
  widths[cols - 1] = CONTENT_W - colW * (cols - 1);

  const mkRow = (cells, isHeader) =>
    new TableRow({
      tableHeader: !!isHeader,
      children: cells.map((c, i) =>
        new TableCell({
          borders: cellBorders,
          width: { size: widths[i], type: WidthType.DXA },
          shading: isHeader ? { fill: "D9E2F3", type: ShadingType.CLEAR } : undefined,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            spacing: { line: 240, lineRule: "auto" },
            children: parseInline(c, { bold: !!isHeader }),
          })],
        })
      ),
    });

  const rows = [];
  if (b.header && b.header.length) rows.push(mkRow(b.header, true));
  (b.rows || []).forEach((r) => rows.push(mkRow(r, false)));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows });
}

function imageBlock(b) {
  if (!b.path || !fs.existsSync(b.path)) {
    return [new Paragraph({ children: parseInline(`[image not found: ${b.path || ""}]`, { italics: true }) })];
  }
  const ext = b.path.split(".").pop().toLowerCase();
  const w = b.width || 400;
  const h = b.height || Math.round(w * 0.66);
  const out = [new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: b.caption ? 0 : 120 },
    children: [new ImageRun({
      type: ext === "jpg" ? "jpeg" : ext,
      data: fs.readFileSync(b.path),
      transformation: { width: w, height: h },
    })],
  })];
  if (b.caption) out.push(captionPara(L.figure, ++figureCount, b.caption));
  return out;
}

function renderBlocks(blocks) {
  const out = [];
  (blocks || []).forEach((b) => {
    if (b.type === "subheading") {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: parseInline(b.text) }));
    } else if (b.type === "subsubheading") {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: parseInline(b.text) }));
    } else if (b.type === "paragraph") {
      out.push(new Paragraph({
        spacing: { line: LINE, lineRule: "auto", after: 160 },
        alignment: AlignmentType.JUSTIFIED,
        indent: FIRST_INDENT ? { firstLine: FIRST_INDENT } : undefined,
        children: parseInline(b.text),
      }));
    } else if (b.type === "bullets") {
      (b.items || []).forEach((it) =>
        out.push(new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { line: LINE, lineRule: "auto" },
          children: parseInline(it),
        })));
    } else if (b.type === "numbered") {
      (b.items || []).forEach((it) =>
        out.push(new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { line: LINE, lineRule: "auto" },
          children: parseInline(it),
        })));
    } else if (b.type === "table") {
      if (b.caption) out.push(captionPara(L.table, ++tableCount, b.caption));
      out.push(tableBlock(b));
      out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    } else if (b.type === "image") {
      imageBlock(b).forEach((p) => out.push(p));
    } else if (b.type === "pagebreak") {
      out.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });
  return out;
}

// ---- Cover ----
const coverChildren = [];
const cover = data.cover || {};
coverChildren.push(new Paragraph({ spacing: { before: 1200 }, children: [] }));
if (cover.logoPath && fs.existsSync(cover.logoPath)) {
  const ext = cover.logoPath.split(".").pop().toLowerCase();
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new ImageRun({ type: ext === "jpg" ? "jpeg" : ext, data: fs.readFileSync(cover.logoPath), transformation: { width: 120, height: 120 } })],
  }));
}
(cover.lines || []).forEach((l) =>
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: l.after != null ? l.after : 120 },
    children: [new TextRun({ text: l.text, bold: !!l.bold, italics: !!l.italic, size: (l.size || 12) * 2, font: FONT })],
  })));
coverChildren.push(new Paragraph({ children: [new PageBreak()] }));

// ---- Body ----
const bodyChildren = [];
if (opt.toc) {
  bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: HEAD_ALIGN, children: parseInline(L.toc) }));
  bodyChildren.push(new TableOfContents(L.toc, { hyperlink: true, headingStyleRange: "1-3" }));
  bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
}
(data.sections || []).forEach((s) => {
  if (s.heading) bodyChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: HEAD_ALIGN, children: parseInline(s.heading) }));
  renderBlocks(s.blocks).forEach((p) => bodyChildren.push(p));
});

// ---- Document ----
const footer = opt.pageNumbers
  ? new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT })] })] })
  : undefined;

const pageProps = { size: A4, margin: MARGIN };

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONT, size: SIZE } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT },
        paragraph: { spacing: { before: 180, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, italics: true, font: FONT },
        paragraph: { spacing: { before: 140, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  features: { updateFields: !!opt.toc },
  sections: [
    { properties: { page: pageProps }, children: coverChildren },
    {
      properties: { page: Object.assign({ pageNumbers: { start: 1 } }, pageProps) },
      footers: footer ? { default: footer } : undefined,
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("OK ->", outPath);
});
