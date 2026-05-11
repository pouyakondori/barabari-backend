#!/usr/bin/env python3
"""
Translate all clause texts from English to Persian using Google Translate.
Processes in batches to avoid rate limiting.
"""
import json
import time
import sys
from deep_translator import GoogleTranslator

def translate_batch(texts, max_retries=3):
    """Translate a list of texts, handling rate limits."""
    translator = GoogleTranslator(source='en', target='fa')
    results = []
    for i, text in enumerate(texts):
        for attempt in range(max_retries):
            try:
                # Google Translate has a 5000 char limit per request
                if len(text) > 4500:
                    # Split long texts
                    mid = len(text) // 2
                    # Find a sentence boundary near the middle
                    for j in range(mid, min(mid + 200, len(text))):
                        if text[j] in '.;':
                            mid = j + 1
                            break
                    part1 = translator.translate(text[:mid])
                    time.sleep(0.3)
                    part2 = translator.translate(text[mid:])
                    result = part1 + ' ' + part2
                else:
                    result = translator.translate(text)
                results.append(result)
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    wait = (attempt + 1) * 2
                    print(f"  Retry {attempt+1} after error: {e}, waiting {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"  Failed to translate: {text[:50]}... Error: {e}")
                    results.append('')  # Empty fallback
        
        # Small delay between requests to avoid rate limiting
        if i > 0 and i % 10 == 0:
            time.sleep(1)
    
    return results

def translate_constitution(filename):
    """Translate all clause texts in a constitution JSON file."""
    with open(filename) as f:
        data = json.load(f)
    
    total_clauses = sum(len(art['clauses']) for ch in data for art in ch['articles'])
    translated = 0
    
    print(f"Translating {filename}: {total_clauses} clauses")
    
    for ch_idx, chapter in enumerate(data):
        for art_idx, article in enumerate(chapter['articles']):
            for clause in article['clauses']:
                en_text = clause['text']['en']
                if not en_text:
                    clause['text']['fa'] = ''
                    continue
                
                translated += 1
                if translated % 50 == 0:
                    print(f"  Progress: {translated}/{total_clauses}")
                
                results = translate_batch([en_text])
                clause['text']['fa'] = results[0] if results else ''
                
                time.sleep(0.2)  # Rate limit
    
    # Save translated file
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"  Done: {translated}/{total_clauses} clauses translated")

if __name__ == '__main__':
    files = sys.argv[1:] if len(sys.argv) > 1 else ['germany_constitution.json', 'portugal_constitution.json']
    for f in files:
        translate_constitution(f)
        print()
