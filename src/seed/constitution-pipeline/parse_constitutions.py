#!/usr/bin/env python3
"""
Parse Germany and Portugal constitution PDFs into structured JSON.
Outputs: germany_constitution.json, portugal_constitution.json
"""
import PyPDF2
import json
import re
import sys

def extract_full_text(pdf_path):
    reader = PyPDF2.PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + '\n'
    return text

def clean_text(text):
    """Clean up PDF extraction artifacts."""
    # Fix hyphenation at line breaks
    text = re.sub(r'-\s*\n\s*', '', text)
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    # Fix common OCR issues
    text = text.replace('\u200b', '')  # zero-width space
    text = text.replace('\u00ad', '')  # soft hyphen
    return text.strip()

def parse_germany(text):
    """Parse Germany Basic Law into chapters, articles, clauses."""
    # Remove table of contents and front matter - find the Preamble
    preamble_match = re.search(r'Preamble\s*\n\s*Conscious of their responsibility', text)
    if preamble_match:
        text = text[preamble_match.start():]
    
    # Remove the "Extracts from the German Constitution of 11 August 1919" appendix
    appendix_match = re.search(r'Extracts from the German Constitution\s*\n?\s*of 11 August 1919', text)
    if appendix_match:
        text = text[:appendix_match.start()]
    
    text = clean_text(text)
    
    # Define the chapter structure of the German Basic Law
    chapter_patterns = [
        (r'I\.\s*Basic\s*Rights', 'I', 'Basic Rights', 'حقوق اساسی'),
        (r'II\.\s*The\s*Federation\s*and\s*the\s*L.nder', 'II', 'The Federation and the Länder', 'فدراسیون و ایالات'),
        (r'III\.\s*The\s*Bundestag', 'III', 'The Bundestag', 'بوندستاگ'),
        (r'IV\.\s*The\s*Bundesrat', 'IV', 'The Bundesrat', 'بوندسرات'),
        (r'IVa\.\s*The\s*Joint\s*Committee', 'IVa', 'The Joint Committee', 'کمیته مشترک'),
        (r'V\.\s*The\s*Federal\s*President', 'V', 'The Federal President', 'رئیس‌جمهور فدرال'),
        (r'VI\.\s*The\s*Federal\s*Government', 'VI', 'The Federal Government', 'دولت فدرال'),
        (r'VII\.\s*Federal\s*Legislation', 'VII', 'Federal Legislation and Legislative Procedures', 'قانون‌گذاری فدرال و فرآیندهای تقنینی'),
        (r'VIII\.\s*The\s*Execution\s*of\s*Federal\s*Laws', 'VIII', 'The Execution of Federal Laws and the Federal Administration', 'اجرای قوانین فدرال و اداره فدرال'),
        (r'VIIIa\.\s*Joint\s*Tasks', 'VIIIa', 'Joint Tasks', 'وظایف مشترک'),
        (r'IX\.\s*The\s*Judiciary', 'IX', 'The Judiciary', 'قوه قضاییه'),
        (r'X\.\s*Finance', 'X', 'Finance', 'امور مالی'),
        (r'Xa\.\s*State\s*of\s*Defence', 'Xa', 'State of Defence', 'وضعیت دفاعی'),
        (r'XI\.\s*Transitional\s*and\s*Concluding', 'XI', 'Transitional and Concluding Provisions', 'مقررات انتقالی و پایانی'),
    ]
    
    # Find chapter boundaries
    chapter_positions = []
    for pattern, num, title_en, title_fa in chapter_patterns:
        match = re.search(pattern, text)
        if match:
            chapter_positions.append((match.start(), num, title_en, title_fa))
    
    chapter_positions.sort(key=lambda x: x[0])
    
    chapters = []
    for i, (pos, num, title_en, title_fa) in enumerate(chapter_positions):
        end_pos = chapter_positions[i+1][0] if i+1 < len(chapter_positions) else len(text)
        chapter_text = text[pos:end_pos]
        
        articles = parse_germany_articles(chapter_text, num)
        
        chapters.append({
            'number': i + 1,
            'title': {'en': title_en, 'fa': title_fa},
            'articles': articles,
            'order': i + 1,
        })
    
    return chapters

def parse_germany_articles(chapter_text, chapter_num):
    """Parse articles within a German chapter."""
    # Match: Article 1 [Title] or Article 12a [Title]
    article_pattern = r'Article\s+(\d+[a-z]?)\s*\[([^\]]+)\]'
    
    matches = list(re.finditer(article_pattern, chapter_text))
    
    articles = []
    for i, match in enumerate(matches):
        art_num = match.group(1)
        art_title = match.group(2).strip()
        
        # Get article text
        start = match.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(chapter_text)
        art_text = chapter_text[start:end].strip()
        
        # Parse clauses (paragraphs numbered (1), (2), etc.)
        clauses = parse_germany_clauses(art_text, art_num)
        
        # If no numbered clauses found, the entire text is a single clause
        if not clauses and art_text.strip():
            # Clean article text
            cleaned = clean_article_text(art_text)
            if cleaned:
                clauses = [{
                    'number': 1,
                    'text': {'en': cleaned, 'fa': ''},
                    'order': 1,
                }]
        
        articles.append({
            'number': art_num,
            'title': {'en': art_title, 'fa': ''},
            'clauses': clauses,
            'order': i + 1,
        })
    
    return articles

def clean_article_text(text):
    """Clean up article text by removing page headers and numbers."""
    # Remove page-like headers (e.g., "I. Basic Rights  15")
    text = re.sub(r'^[IVXa]+\.?\s+[A-Z][^\n]*\s+\d+\s*', '', text)
    # Remove standalone numbers that are page numbers
    text = re.sub(r'^\s*\d{1,3}\s*$', '', text, flags=re.MULTILINE)
    # Remove header patterns like "I. Basic Rights  16"
    text = re.sub(r'[IVXa]+\.?\s+(?:Basic Rights|The Federation|The Bundestag|The Bundesrat|The Joint Committee|The Federal President|The Federal Government|Federal Legislation|The Execution|Joint Tasks|The Judiciary|Finance|State of Defence|Transitional)\s*[^\n]*\d+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_germany_clauses(art_text, art_num):
    """Parse numbered clauses (1), (2), etc. from German article text."""
    # Match clause numbering: (1), (2), etc.
    clause_pattern = r'\((\d+)\)'
    
    matches = list(re.finditer(clause_pattern, art_text))
    
    if not matches:
        return []
    
    clauses = []
    seen_numbers = set()
    
    for i, match in enumerate(matches):
        clause_num = int(match.group(1))
        
        # Skip if we've already seen this number (likely a reference, not a new clause)
        if clause_num in seen_numbers:
            continue
        
        # Clause numbers should be sequential starting from 1
        if clause_num != len(seen_numbers) + 1:
            # If clause_num > expected, it's likely a reference
            if clause_num > len(seen_numbers) + 1:
                continue
        
        seen_numbers.add(clause_num)
        
        start = match.end()
        # Find the next clause or end of text
        next_clause = None
        for j in range(i+1, len(matches)):
            next_num = int(matches[j].group(1))
            if next_num == clause_num + 1:
                next_clause = matches[j]
                break
        
        if next_clause:
            end = next_clause.start()
        else:
            end = len(art_text)
        
        clause_text = art_text[start:end].strip()
        clause_text = clean_article_text(clause_text)
        
        if clause_text:
            clauses.append({
                'number': clause_num,
                'text': {'en': clause_text, 'fa': ''},
                'order': clause_num,
            })
    
    return clauses

def parse_portugal(text):
    """Parse Portugal Constitution into chapters (Parts/Titles), articles, clauses."""
    # The text has TOC first, then actual content. 
    # We need to find the actual content sections (not TOC entries).
    # Actual content starts around position 15000+ in the extracted text.
    
    # Find sections by their position in actual content (skip TOC which is < 14000 chars)
    section_defs = [
        ('Fundamental Principles', 'اصول بنیادین', r'Fundamental\s+principles\s+\n', 14000),
        ('Part I - Fundamental Rights and Duties', 'بخش اول - حقوق و تکالیف اساسی', r'PART\s+I\s', 14000),
        ('Part II - Economic Organization', 'بخش دوم - سازمان اقتصادی', r'PART\s+II\s', 50000),
        ('Part III - Organization of Political Power', 'بخش سوم - سازمان قدرت سیاسی', r'PART\s+III\s', 50000),
        ('Part IV - Guaranteeing and Revision of the Constitution', 'بخش چهارم - تضمین و بازنگری قانون اساسی', r'PART\s+IV\s', 100000),
        ('Final and Transitional Provisions', 'مقررات نهایی و انتقالی', r'Final\s+and\s+transitional', 200000),
    ]
    
    section_positions = []
    for title_en, title_fa, pattern, min_pos in section_defs:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            if match.start() >= min_pos:
                section_positions.append((match.start(), title_en, title_fa))
                break
    
    section_positions.sort(key=lambda x: x[0])
    
    # Debug output
    for pos, title_en, title_fa in section_positions:
        print(f"  Section '{title_en}' found at position {pos}")
    
    chapters = []
    for i, (pos, title_en, title_fa) in enumerate(section_positions):
        end_pos = section_positions[i+1][0] if i+1 < len(section_positions) else len(text)
        section_text = text[pos:end_pos]
        
        articles = parse_portugal_articles(section_text)
        
        chapters.append({
            'number': i + 1,
            'title': {'en': title_en, 'fa': title_fa},
            'articles': articles,
            'order': i + 1,
        })
    
    return chapters

def parse_portugal_articles(section_text):
    """Parse articles within a Portuguese section."""
    # Portugal articles have a specific format:
    # Article N
    # (Title)
    # The article number is on its own line (preceded by newline)
    # and the title is in parentheses on the next line
    article_pattern = r'Article\s+(\d+)\s*\n?\s*\(([^)]*(?:\n[^)]*)?)\)'
    
    matches = list(re.finditer(article_pattern, section_text))
    
    # Deduplicate: keep only the first occurrence of each article number
    # and filter out false positives (references within clause text)
    seen = set()
    unique_matches = []
    prev_num = 0
    for match in matches:
        art_num = int(match.group(1))
        if art_num not in seen:
            seen.add(art_num)
            unique_matches.append(match)
            prev_num = art_num
    matches = unique_matches
    
    articles = []
    for i, match in enumerate(matches):
        art_num = int(match.group(1))
        art_title = match.group(2).strip()
        
        start = match.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(section_text)
        art_text = section_text[start:end].strip()
        
        clauses = parse_portugal_clauses(art_text)
        
        articles.append({
            'number': art_num,
            'title': {'en': art_title, 'fa': ''},
            'clauses': clauses,
            'order': i + 1,
        })
    
    return articles

def parse_portugal_clauses(art_text):
    """Parse numbered clauses from Portuguese article text."""
    # Portugal uses: 1. text or standalone paragraph
    # Check for numbered clauses first
    clause_pattern = r'(?:^|\n)\s*(\d+)\.\s+'
    
    matches = list(re.finditer(clause_pattern, art_text))
    
    if matches:
        clauses = []
        for i, match in enumerate(matches):
            clause_num = int(match.group(1))
            start = match.end()
            end = matches[i+1].start() if i+1 < len(matches) else len(art_text)
            clause_text = art_text[start:end].strip()
            clause_text = re.sub(r'\s+', ' ', clause_text)
            
            if clause_text:
                clauses.append({
                    'number': clause_num,
                    'text': {'en': clause_text, 'fa': ''},
                    'order': clause_num,
                })
        return clauses
    else:
        # Single clause - the entire article text
        cleaned = re.sub(r'\s+', ' ', art_text).strip()
        if cleaned:
            return [{
                'number': 1,
                'text': {'en': cleaned, 'fa': ''},
                'order': 1,
            }]
        return []

def main():
    # Parse Germany
    print("Parsing Germany Basic Law...")
    de_text = extract_full_text('germany_constitution_law.pdf')
    de_chapters = parse_germany(de_text)
    
    total_articles = sum(len(ch['articles']) for ch in de_chapters)
    total_clauses = sum(sum(len(a['clauses']) for a in ch['articles']) for ch in de_chapters)
    print(f"  Chapters: {len(de_chapters)}")
    print(f"  Articles: {total_articles}")
    print(f"  Clauses: {total_clauses}")
    
    for ch in de_chapters:
        art_count = len(ch['articles'])
        clause_count = sum(len(a['clauses']) for a in ch['articles'])
        print(f"    Chapter {ch['number']}: {ch['title']['en']} - {art_count} articles, {clause_count} clauses")
    
    with open('germany_constitution.json', 'w') as f:
        json.dump(de_chapters, f, indent=2, ensure_ascii=False)
    
    # Parse Portugal
    print("\nParsing Portugal Constitution...")
    pt_text = extract_full_text('portugal_constitution_law.pdf')
    pt_chapters = parse_portugal(pt_text)
    
    total_articles = sum(len(ch['articles']) for ch in pt_chapters)
    total_clauses = sum(sum(len(a['clauses']) for a in ch['articles']) for ch in pt_chapters)
    print(f"  Chapters: {len(pt_chapters)}")
    print(f"  Articles: {total_articles}")
    print(f"  Clauses: {total_clauses}")
    
    for ch in pt_chapters:
        art_count = len(ch['articles'])
        clause_count = sum(len(a['clauses']) for a in ch['articles'])
        print(f"    Chapter {ch['number']}: {ch['title']['en']} - {art_count} articles, {clause_count} clauses")
    
    with open('portugal_constitution.json', 'w') as f:
        json.dump(pt_chapters, f, indent=2, ensure_ascii=False)
    
    print("\nDone! JSON files written.")

if __name__ == '__main__':
    main()
