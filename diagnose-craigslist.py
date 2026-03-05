#!/usr/bin/env python3
"""
Diagnose available Craigslist sections and search functionality
"""

import urllib.request
import re
import json

def test_section(section, query):
    """Test if a section returns results"""
    url = f"https://chicago.craigslist.org/search/{section}?query={query}"
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        # Count potential listings
        listings = re.findall(r'<a href="https://chicago\.craigslist\.org/[^"]*?/d/[^"]*?"', html)
        
        # Check what title the page has
        title_match = re.search(r'<title>([^<]+)</title>', html)
        title = title_match.group(1) if title_match else 'N/A'
        
        # Check for "no results"
        no_results = 'no results' in html.lower() or len(listings) == 0
        
        return {
            'section': section,
            'query': query,
            'url': url,
            'listings_found': len(listings),
            'page_title': title,
            'status': 'NO RESULTS' if no_results else f'{len(listings)} LISTINGS'
        }
    except Exception as e:
        return {
            'section': section,
            'query': query,
            'url': url,
            'error': str(e),
            'status': 'ERROR'
        }

# Test various sections
sections_to_test = [
    'sss',    # for sale
    'hsh',    # household services
    'hss',    # household services (wanted)
    'lbg',    # labor gigs
    'dmg',    # domestic gigs
    'srv',    # services offered
    'jjj',    # jobs
]

queries_to_test = [
    'repair',
    'painter',
    'construction',
    'help',
    'need',
]

print("Testing Craigslist sections...\n")
print(f"{'Section':<10} {'Query':<15} {'Status':<20} {'Found':<10}")
print("-" * 60)

results = []
for section in sections_to_test:
    for query in queries_to_test:
        result = test_section(section, query)
        results.append(result)
        
        if 'error' not in result:
            print(f"{section:<10} {query:<15} {result['status']:<20} {result['listings_found']:<10}")
        else:
            print(f"{section:<10} {query:<15} {'ERROR':<20} {result['error'][:20]}")

# Save full results
with open('C:\\Users\\trisd\\clawd\\craigslist-diagnosis.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\nDiagnostics saved to craigslist-diagnosis.json")
