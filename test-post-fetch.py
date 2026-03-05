#!/usr/bin/env python3
import urllib.request
import re
from datetime import datetime

# Test fetching one specific post (a contractor ad)
test_urls = [
    'https://chicago.craigslist.org/chc/lbg/d/skokie-trade-contractors-make-2026-best/7915155545.html',
    'https://chicago.craigslist.org/sox/lbg/d/chicago-gc-seeks-professional-painter/7912983456.html',
]

for url in test_urls:
    print(f"\n{'='*70}")
    print(f"URL: {url}")
    print('='*70)
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        print(f"[*] HTML fetched: {len(html)} bytes")
        
        # Extract title
        title_match = re.search(r'<span class="postingtitle"[^>]*><span class="postingtitletext"[^>]*>([^<]+)</span>', html)
        title = title_match.group(1).strip() if title_match else 'Unknown'
        print(f"[*] Title: {title}")
        
        # Extract body
        body_match = re.search(r'<section id="postingbody"[^>]*>(.+?)</section>', html, re.DOTALL)
        if body_match:
            body = body_match.group(1)
            body = re.sub(r'<[^>]+>', ' ', body)
            body = re.sub(r'\s+', ' ', body).strip()
            print(f"[*] Body (first 300 chars): {body[:300]}")
        else:
            print("[!] Could not find posting body")
            body = ''
        
        # Check red flags
        full_text = (title + ' ' + body).lower()
        red_flags_found = []
        
        red_flags = [
            ('hiring', r'\bhiring\b'),
            ('position', r'\bposition\b'),
            ('we do', r'\bwe\s+do\b'),
            ('years exp', r'\byears\s+of\s+experience\b'),
        ]
        
        for name, pattern in red_flags:
            if re.search(pattern, full_text):
                red_flags_found.append(name)
        
        print(f"[*] Red flags: {red_flags_found if red_flags_found else 'None'}")
        
        # Check homeowner indicators
        homeowner_indicators = []
        patterns = [
            ('pronouns', r'\b(?:I|we|my|our)\b'),
            ('need help', r'\b(?:need help|looking for|seeking)\b'),
            ('project', r'\b(?:repair|paint|bathroom|kitchen|damage)\b'),
        ]
        
        for name, pattern in patterns:
            if re.search(pattern, full_text):
                homeowner_indicators.append(name)
        
        print(f"[*] Homeowner indicators: {homeowner_indicators}")
        print()
        
    except Exception as e:
        print(f"[!] Error: {e}")
