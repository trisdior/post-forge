#!/usr/bin/env python3
"""
Test different regex patterns against actual Craigslist HTML
"""

import urllib.request
import re
import json

def fetch_html(section, query):
    """Fetch actual Craigslist HTML"""
    url = f"https://chicago.craigslist.org/search/{section}?query={query}"
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching: {e}")
        return None

def test_patterns(html, section, query):
    """Test various regex patterns"""
    patterns = {
        'pattern_1': r'href="(https://chicago\.craigslist\.org/[^"]*?/d/[^"]+?)">([^<]*)</a>',
        'pattern_2': r'href="(https://chicago\.craigslist\.org/[a-z]{3}/[a-z]{3}/d/[^"]+?)">([^<]*)</a>',
        'pattern_3': r'<a[^>]*href="(https://chicago\.craigslist\.org/[^"]*?\.html)"[^>]*>([^<]+)</a>',
        'pattern_4': r'<a[^>]*href="([^"]*chicago\.craigslist\.org[^"]*?/d/[^"]*?)"[^>]*>([^<]+)</a>',
        'pattern_5': r'<a[^>]*href="([^"]*craigslist\.org[^"]*?)"[^>]*class="[^"]*result[^"]*"[^>]*>([^<]+)</a>',
    }
    
    print(f"\nTesting patterns for [{section}] '{query}':")
    print("-" * 60)
    
    for name, pattern in patterns.items():
        matches = re.findall(pattern, html)
        print(f"{name}: {len(matches)} matches")
        if matches:
            for i, (url, title) in enumerate(matches[:3], 1):
                print(f"  {i}. {title[:50]}")
                print(f"     URL: {url[:70]}...")

# Test with known working section/query
html = fetch_html('lbg', 'painter')
if html:
    test_patterns(html, 'lbg', 'painter')
    
    # Save HTML for inspection
    with open('C:\\Users\\trisd\\clawd\\lbg-painter.html', 'w') as f:
        f.write(html[:10000])
    print("\n[*] Saved sample HTML to lbg-painter.html")
    
    # Count unique URLs found by a simple approach
    simple_links = re.findall(r'href="(https://chicago\.craigslist\.org[^"]+)"', html)
    print(f"\nTotal href URLs found: {len(simple_links)}")
    # Filter for /d/ paths (actual listings, not nav)
    listing_links = [l for l in simple_links if '/d/' in l]
    print(f"Listing URLs (/d/): {len(listing_links)}")
    if listing_links:
        print(f"  Sample: {listing_links[0]}")
