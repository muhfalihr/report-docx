---
name: report-docx
description: "Create professional .docx reports from one of three structured templates (college/coursework report, work report, or general report). MUST be used whenever the user asks for a report in Word/.docx format — including 'lab report', 'assignment report', 'coursework report', 'work report', 'internship report', 'project report', 'activity report', 'make a report', 'generate report', 'report docx', or names one of the templates above. This skill MUST collect the report's content/details from the user through a structured interview before building the document, and MUST NOT fill in dummy/fabricated data. Do not use for PDF, spreadsheets, or reports not requested as a Word file."
license: Proprietary
---

# Report DOCX

Skill for producing professional Word (.docx) reports from one of three structured templates. It is built **on top of** the built-in `docx` skill (`/mnt/skills/public/docx/SKILL.md`) for all document mechanics. It adds: (1) clear report template structures, and (2) a mandatory interview phase to gather content from the user.

**Language note:** these instructions are in English, but the **generated document follows the user's requested language**. If the user writes in Indonesian and wants an Indonesian report, all cover lines, headings, body text, and labels go in Indonesian. Set `options.labels` (and write the headings/content) in the document's target language.

## References this skill is built on

This skill is explicitly built on the references below — don't guess, read the source files when needed:

- **DOCX mechanics**: `/mnt/skills/public/docx/SKILL.md` — all `.docx` generation (docx-js, page size, styles, headings, tables, lists, validation) follows this skill. MUST be read before writing document code.
- **Report template structures**: `references/templates.md` (in this skill) — the content outline for each report type.
- **Document generator**: `scripts/build_report.js` (in this skill) — a `docx-js`-based Node.js script that renders report-content JSON into a `.docx`.

The document format follows common academic/professional conventions (A4 paper, 1-inch margins, numbered headings, title page, optional table of contents). There is no single mandatory standard; if the user's institution has its own official guideline, ask for it and adapt.

## The most important rule: DO NOT fabricate content

**This skill is FORBIDDEN from filling a report with dummy data, fake placeholders, or invented content.** Every substantive part (title, names, chapter body, data, conclusions) must come from the user. If the user hasn't provided some information, **ask for it** — don't fill it in yourself. Skip optional parts the user says aren't needed; don't pad them with filler.

The only things Claude may produce itself are: the template's built-in outline/headings, and — only when the user explicitly asks "help me write/draft the content of chapter X" — a draft based on the points/material the user provided. Even then, never invent facts, figures, or references the user didn't give.

## Workflow

### Step 1 — Choose a template

Ask the user which report type they want (if not already clear from context). Three options:

1. **Coursework / College Report** — academic/lab report (cover, student & course identity, introduction, theory, discussion, conclusion, references).
2. **Work Report** — professional/organizational report (cover, executive summary, background, methodology/execution, results, recommendations, appendices).
3. **General Report** — neutral, flexible outline (title, introduction, body/discussion with any number of sections, closing).

The detailed outline for each template is in `references/templates.md`. Read that file after the user chooses.

### Step 2 — Interview (MANDATORY, before building the document)

Collect content from the user through structured questions. **Do not proceed to build the document until the required information is gathered.** Use `references/templates.md` to know which fields to ask per template.

Questioning guidelines:
- Ask for **metadata/identity** first (title, name, student ID/role, institution/company, course/project, date, etc. per template).
- Then ask for the **content of each section**. For each chapter/section, ask whether the user wants to (a) provide the content themselves, (b) give bullet points for Claude to turn into a draft, or (c) skip that section.
- Group questions so they aren't exhausting — you may ask several metadata fields at once, but keep it to one tidy message.
- Confirm options: automatic table of contents (yes/no), page numbering (yes/no), logo/image on the cover (if any, ask for the file path).
- If the user wants Claude to draft content, ask for the raw material first; don't fill anything without source material.

When a field is better asked via choice buttons (template type, TOC yes/no, etc.) and the `ask_user_input_v0` tool is available, use it. Otherwise ask as brief prose.

Once gathered, give a **short recap** of what will go in and ask the user to confirm before generating. Explicitly flag which parts are empty/skipped.

### Step 3 — Build the document

1. Read `/mnt/skills/public/docx/SKILL.md` if you haven't (for docx-js rules: A4 page size, heading style overrides, dual-width tables, lists via `LevelFormat`, etc.).
2. Read `references/templates.md` for the chosen template's section order.
3. Assemble the report content as a JSON object (see the schema in the header comment of `scripts/build_report.js`), containing **only** the user's data. Write all document-facing text in the user's target language and set `options.labels` accordingly.
4. Render with the generator:

```bash
cd /home/claude/report-docx
npm install docx   # once, if not already installed
node scripts/build_report.js content.json /mnt/user-data/outputs/report.docx
```

   `build_report.js` handles the title page, table of contents (if requested), numbered headings (H1–H3), justified paragraphs with configurable line spacing, lists, tables with captions, inline figures with captions, inline `**bold**`/`*italic*`, and page numbering — following the `docx` skill conventions. Tunable via `options` (font, fontSize, lineSpacing, firstLineIndent, headingAlign, labels).

5. Validate the result:
```bash
python /mnt/skills/public/docx/scripts/office/validate.py /mnt/user-data/outputs/report.docx
```
If it fails, follow the unpack→edit XML→pack repair path from the `docx` skill.

### Step 4 — Deliver

Use `present_files` to hand the final `.docx` to the user with a brief one-sentence summary. Offer revisions if any part is still empty.

## Requirements

- Node.js + the `docx` package (`npm install docx`)
- The built-in `docx` skill at `/mnt/skills/public/docx/` (for validation & XML editing fallback)
- Python (for the validation script from the `docx` skill)
