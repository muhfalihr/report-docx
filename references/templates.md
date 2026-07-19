# Report Template Structures

Three templates. After the user picks one, use the outline below as (a) the list of fields to ask during the interview and (b) the section order of the document. **All substantive content comes from the user — never fill it in yourself.**

Markers: **[required]** = must be asked and cannot be empty; **[optional]** = offer it, the user may skip.

> Language: write the actual cover lines, headings, and body in the user's target language. The labels below ("Background", "Conclusion", etc.) are just outline names — translate them to match the document's language.

---

## 1. Coursework / College Report

### Title page (cover)
- Report title **[required]**
- Assignment type (e.g. "Lab Report", "Final Project", "Project Report") **[required]**
- Student name **[required]**
- Student ID **[required]**
- Course **[required]**
- Lecturer / instructor **[optional]**
- Study program / faculty **[optional]**
- University **[required]**
- City & year **[required]**
- University logo (image path) **[optional]**

### Body
1. **CHAPTER I — Introduction**: background, problem statement, objectives **[content from user / draft from user's points]**
2. **CHAPTER II — Theoretical Basis / Literature Review** **[optional]**
3. **CHAPTER III — Methodology / Lab Procedure** **[optional]**
4. **CHAPTER IV — Results and Discussion** **[required — at minimum a discussion]**
5. **CHAPTER V — Conclusion and Recommendations** **[required]**
6. **References / Bibliography** **[optional]** — ask the user for the reference list; never fabricate citations.

Options: automatic table of contents, page numbering.

---

## 2. Work Report

### Title page (cover)
- Report title **[required]**
- Report type (e.g. "Monthly Report", "Internship Report", "Project Report", "Activity Report") **[required]**
- Author name **[required]**
- Position / division **[optional]**
- Institution / company name **[required]**
- Period / report date **[required]**
- Addressed to (supervisor/recipient) **[optional]**
- Institution logo (image path) **[optional]**

### Body
1. **Executive Summary** **[optional]** — a brief summary of the main findings.
2. **Background / Introduction** **[required]**
3. **Objectives & Scope** **[optional]**
4. **Methodology / Activity Execution** **[required]**
5. **Results / Findings** **[required]** — may include data tables (ask the user for the data).
6. **Analysis / Discussion** **[optional]**
7. **Conclusion & Recommendations** **[required]**
8. **Appendices** **[optional]**

Options: automatic table of contents, page numbering.

---

## 3. Academic Paper / Student Assignment (Makalah / Laporan Tugas)

Based on the standard Indonesian academic report format. Use this for **college coursework papers, makalah, tugas besar, mini-thesis (skripsi/TA-style)** — anything that follows the BAB I–V structure. This is the **structure only**; never carry over a specific institution name, faculty, or logo — collect those from the user.

### Page setup (bake these into `options`)
- Paper A4, font **Times New Roman 12**, line spacing **1.5**, body **justified**, first line indented.
- Margins (Indonesian standard): **left 4 cm, top/right/bottom 3 cm** → `options.margins: { left: 4, top: 3, right: 3, bottom: 3 }`.
- Automatic **Daftar Isi** (TOC) and page numbering on.

### Title page (cover) — centered, no logo unless the user supplies one
- Title (JUDUL, uppercase) **[required]**
- "Oleh :" label + Author name **[required]**
- Student ID / NIM **[required]**
- Study program (Program Studi) **[required]**
- Faculty (Fakultas) **[optional]**
- University / institution **[required]**
- City & year **[required]**
- Logo **[optional]** — only if the user provides one.

### Body — fixed BAB structure
1. **BAB I PENDAHULUAN**
   - 1.1 Latar Belakang **[required]**
   - 1.2 Rumusan Masalah **[required]**
   - 1.3 Tujuan **[required]**
   - 1.4 Batasan Masalah **[optional]**
2. **BAB II TINJAUAN PUSTAKA** (Landasan Teori) — 2.1 Penelitian Terdahulu, then theory subsections **[required]**
3. **BAB III METODOLOGI PENELITIAN** — 3.1 Desain Sistem / metode **[required]**
4. **BAB IV HASIL DAN ANALISIS** (Hasil dan Pembahasan) **[required]**
5. **BAB V KESIMPULAN DAN SARAN**
   - 5.1 Kesimpulan **[required]**
   - 5.2 Saran **[optional]**
6. **DAFTAR PUSTAKA** **[required]** — Harvard/name-year style; only what the user provides, never fabricate citations.

### Academic conventions (apply throughout)
- Citations: name–year Harvard style, e.g. *(Sukma, 2010)*.
- Tables: caption **above**, numbered "Tabel N."; figures: caption **below**, numbered "Gambar N."; equations numbered (1), (2)… right-aligned.
- Reference figures/tables/equations by number in the text — avoid "gambar di bawah ini".
- Headings map to: **BAB** → Heading 1; **numbered subsection (1.1, 2.1…)** → Heading 2 (`subheading`); deeper (1.1.1) → Heading 3 (`subsubheading`).

For a lighter, non-BAB coursework report, use template 1 above instead.

---

## 4. General Report

A neutral, flexible outline. Use it when the report type doesn't fit either of the two above.

### Title page
- Title **[required]**
- Subtitle / caption **[optional]**
- Author **[required]**
- Organization / affiliation **[optional]**
- Date **[required]**
- Logo (image path) **[optional]**

### Body
1. **Introduction** **[required]**
2. **Body / Discussion** **[required]** — any number of sections; ask the user how many sections and each section's title, then fill in each section.
3. **Closing / Conclusion** **[required]**
4. **References / Appendices** **[optional]**

Options: automatic table of contents, page numbering.

---

## Interview notes

- Always separate **metadata** (quick, short fields) from **section content** (needs material from the user).
- For each body section, offer the user 3 choices: write it themselves / give points to be polished / skip it.
- Tables & data: never make up numbers. Ask the user to paste their data (rows/columns) or skip.
- References/bibliography: only include what the user provides. Never produce fake citations.
- Once everything is collected, recap & confirm before generating.
