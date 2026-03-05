#!/usr/bin/env python3
import urllib.request
import re
import json

def test_craigslist():
    """Test Craigslist connectivity and HTML structure"""
    url = 'https://chicago.craigslist.org/search/hsh?query=repair'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            html = response.read().decode('utf-8', errors='ignore')
            print(f'[*] Successfully connected to Craigslist')
            print(f'[*] HTML length: {len(html)} bytes')
            
            # Test various patterns used in the scraper
            patterns = {
                'span.result': r'<span class="result-meta">',
                'data-pid': r'data-pid="(\d+)"',
                'href-standard': r'<a href="(https://chicago\.craigslist\.org/[^"]*?/(\d+)\.html)"[^>]*>',
                'href-flexible': r'href="([^"]*chicago\.craigslist\.org[^"]*\.html)"',
            }
            
            for name, pattern in patterns.items():
                matches = re.findall(pattern, html)
                print(f'[*] Pattern "{name}": {len(matches)} matches')
                if matches and isinstance(matches[0], tuple):
                    print(f'    Sample: {matches[0][0][:80]}')
                elif matches:
                    print(f'    Sample: {matches[0][:80]}')
            
            # Save first 5000 chars of HTML for debugging
            with open('C:\\Users\\trisd\\clawd\\craigslist-sample.html', 'w') as f:
                f.write(html[:5000])
            print('[*] Saved sample HTML to craigslist-sample.html')
            
    except Exception as e:
        print(f'[!] Error: {type(e).__name__}: {e}')

if __name__ == '__main__':
    test_craigslist()
