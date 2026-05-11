# Constitution PDF-to-Database Pipeline

## Overview

This directory contains the complete pipeline for converting a country's constitution PDF into structured, bilingual (English/Persian) data and seeding it into the Barabari MongoDB database. The pipeline produces a hierarchy of **Chapter → Article → Clause**, each with `{ en, fa }` text fields.

## Pipeline Steps

Adding a new country's constitution follows these steps in order:

### Step 1: Obtain the PDF

Place the English-language constitution PDF in this directory, named `{country}_constitution_law.pdf` (e.g., `france_constitution_law.pdf`).

### Step 2: Parse the PDF → JSON

Use `parse_constitutions.py` as a reference to write a parser for the new country. Every constitution has a unique document structure, so the parser must be adapted per country.

```bash
cd src/seed/constitution-pipeline
pip install PyPDF2  # if not installed
python parse_constitutions.py
```

**Key parsing concerns:**

| Concern | Details |
|---|---|
| **PDF text extraction** | Use `PyPDF2.PdfReader` to extract raw text. PDF extraction often introduces artifacts: broken words at line breaks, zero-width spaces, soft hyphens, merged headers. The `clean_text()` helper handles common cases. |
| **TOC vs. content** | Many PDFs have a Table of Contents that looks structurally identical to the real content. Use a `min_pos` threshold (character offset) to skip the TOC and only parse actual content. Portugal required `min_pos: 14000` to skip its TOC. |
| **Chapter detection** | Each country uses different structural divisions (Chapters, Parts, Titles, Sections). Define explicit regex patterns per chapter with known titles. Hardcode these — don't try to auto-detect them. |
| **Article detection** | Common patterns: `Article N [Title]` (Germany), `Article N\n(Title)` (Portugal). Watch for multiline titles (title text wrapping with `\n` inside parentheses or brackets). |
| **Clause detection** | Germany uses `(N)` numbering, Portugal uses `N.` numbering. If no numbered clauses are found, treat the entire article text as a single clause. |
| **Page headers/footers** | PDF extraction often includes page numbers and running headers embedded in the text. Use `clean_article_text()` to strip these. |
| **Duplicate articles** | PDF artifacts or repeated references can produce duplicate article numbers. Deduplicate by keeping only the first occurrence of each article number. |
| **Article number formats** | Some constitutions use compound article numbers like `12a`, `45b`. Parse these as strings and convert to integers in the seed script. |

**Output format** — `{country}_constitution.json`:

```json
[
  {
    "number": 1,
    "title": { "en": "Chapter Title", "fa": "عنوان فصل" },
    "order": 1,
    "articles": [
      {
        "number": 1,
        "title": { "en": "Article Title", "fa": "عنوان ماده" },
        "order": 1,
        "clauses": [
          {
            "number": 1,
            "text": { "en": "Clause text in English.", "fa": "متن بند به فارسی." },
            "order": 1
          }
        ]
      }
    ]
  }
]
```

### Step 3: Add Persian Chapter & Article Titles

Use `add_persian_titles.py` as a reference. This script uses manually curated dictionaries mapping article numbers to their Persian translations.

```bash
python add_persian_titles.py
```

**Guidelines:**
- Chapter titles (`title.fa`) should be set directly in the parser (Step 2) since there are few chapters.
- Article titles require a dictionary of `{ article_number: persian_title }` for each country. These are best translated manually or with AI assistance for accuracy — they are short phrases.
- The script reads the JSON, fills in `title.fa` for each article, and writes it back.

### Step 4: Translate Clause Texts to Persian

Use `translate_clauses.py` for automated Google Translate of clause body text.

```bash
pip install deep-translator  # if not installed
python translate_clauses.py {country}_constitution.json
```

**Important notes:**
- Google Translate has a 5000-character limit per request. The script auto-splits long clauses at sentence boundaries.
- Rate limiting: the script adds delays between requests (0.2s per clause, 1s every 10 clauses). Expect ~1 minute per 100 clauses.
- Typical run times: Germany (523 clauses) ≈ 6 min, Portugal (845 clauses) ≈ 10 min.
- The script modifies the JSON file in-place, filling `text.fa` for each clause.
- Verify after translation: check for empty `fa` fields. The seed script falls back to English text if Persian is empty.
- Google Translate quality is acceptable for initial data; manual corrections can be applied later.

### Step 5: Ensure the Country Exists in the Database

Before seeding the constitution, the country must exist in the `countries` collection with the matching `slug`. Countries are created via the main seed script (`src/seed/seed.ts`) or through the backoffice. The country needs:

- `slug`: lowercase country name (e.g., `"france"`)
- `name`: `{ en: "France", fa: "فرانسه" }`

### Step 6: Update the Seed Script

Edit `src/seed/seedConstitutions.ts` to include the new country:

```typescript
// Add after existing countries
await seedConstitution(
  "france",  // must match country.slug in DB
  path.join(pipelineDir, "france_constitution.json")
);
```

### Step 7: Seed the Database

```bash
cd /path/to/barabari-backend
npm run seed:constitutions
```

This will:
1. Find the country by slug
2. Delete all existing constitution data for that country (chapters, articles, clauses)
3. Create the constitution record (if it doesn't exist)
4. Insert all chapters → articles → clauses from the JSON
5. Auto-assign `topicSlugs` to clauses based on keyword matching

## Data Model Reference

```
Country (slug, name)
  └── Constitution (countryId, fullTextUrl)
        └── Chapter (constitutionId, number, title, order)
              └── Article (chapterId, number, title, order)
                    └── Clause (articleId, countryId, number, text, topicSlugs, order, agreeCount, disagreeCount)
```

All `title` and `text` fields use `ILocalizedString = { fa: string; en: string }`.

## Topic Auto-Assignment

The seed script automatically assigns topic slugs to clauses based on English text keywords:

| Topic Slug | Keywords |
|---|---|
| `freedom-of-speech` | expression, speech, press, opinion, censorship, media, broadcast, information |
| `right-to-education` | education, school, teaching, learning, university, instruction |
| `right-to-life` | life, dignity, integrity, death, torture, inviolable, human rights |
| `fair-trial` | trial, court, judicial, judge, justice, criminal, accused, defence, habeas corpus |
| `freedom-of-religion` | religion, faith, conscience, worship, church, creed, belief |

## Memory Considerations

Loading all constitution data (1000+ clauses with full bilingual text) can cause Node.js OOM with default heap size. The backend dev script uses `NODE_OPTIONS='--max-old-space-size=4096'` to handle this. The `constitutions` list resolver uses `.select()` to load only IDs (not text) for the list view.

## Existing Data

| Country | Chapters | Articles | Clauses |
|---|---|---|---|
| Germany | 14 | 197 | 523 |
| Portugal | 6 | 298 | 845 |

## File Inventory

| File | Purpose |
|---|---|
| `parse_constitutions.py` | PDF → structured JSON parser (Germany & Portugal) |
| `add_persian_titles.py` | Manually curated Persian translations for article titles |
| `translate_clauses.py` | Automated Google Translate for clause body text |
| `germany_constitution.json` | Parsed + translated Germany data (ready to seed) |
| `portugal_constitution.json` | Parsed + translated Portugal data (ready to seed) |
| `CONSTITUTION_PIPELINE.md` | This document |

## Troubleshooting

| Problem | Solution |
|---|---|
| Parser misses articles | Check regex patterns against actual PDF text. Extract PDF text to `.txt` first (`PyPDF2`) and inspect manually. Common issue: multiline titles, merged text with page headers. |
| Duplicate articles in DB | The parser should deduplicate by article number. Check `seen` set logic. |
| Empty Persian translations | Re-run `translate_clauses.py`. Check for rate limiting errors. The seed script falls back to English for empty `fa` fields. |
| Server OOM on full-text queries | Increase `--max-old-space-size` in the dev script. Consider pagination for very large constitutions (500+ clauses). |
| TOC entries parsed as content | Increase the `min_pos` threshold for section detection to skip past the TOC. Print character positions to find the right cutoff. |
