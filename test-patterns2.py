#!/usr/bin/env python3
"""
Test patterns against Craigslist HTML with encoding fix
"""

import urllib.request
import re

url = 'https://chicago.craigslist.org/search/lbg?query=painter'
try:
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    print(f"[*] Fetched {len(html)} bytes")
    
    # Find all href links
    all_hrefs = re.findall(r'href="([^"]+)"', html)
    print(f"[*] Total href attributes: {len(all_hrefs)}")
    
    # Filter for craigslist links with /d/
    listing_hrefs = [h for h in all_hrefs if 'craigslist.org' in h and '/d/' in h]
    print(f"[*] Listing links (/d/): {len(listing_hrefs)}")
    
    if listing_hrefs:
        print(f"\nFirst 5 listing links:")
        for i, link in enumerate(listing_hrefs[:5], 1):
            print(f"  {i}. {link}")
        
        # Try to extract just the ID
        for link in listing_hrefs[:2]:
            id_match = re.search(r'/(\d+)(?:\?|$)', link)
            if id_match:
                post_id = id_match.group(1)
                print(f"     Extracted ID: {post_id}")
    
    # Check for listing titles (links followed by title text)
    # Look for anchor tags with data attributes or class
    title_pattern = r'<a[^>]*href="([^"]*craigslist\.org/[^"]*?/d/[^"]*?)"[^>]*>([^<]+)</a>'
    matches = re.findall(title_pattern, html)
    print(f"\n[*] Matched titles with pattern: {len(matches)}")
    if matches:
        for i, (link, title) in enumerate(matches[:3], 1):
            print(f"  {i}. Title: {title[:60]}")
            print(f"     Link: {link}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
