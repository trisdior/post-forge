import urllib.request
import re

url = 'https://chicago.craigslist.org/search/hsh'
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    print(f"Page size: {len(html)} bytes")
    
    # Look for any posting links - various patterns
    patterns = [
        (r'posting-title[^>]*href="([^"]*)"[^>]*>([^<]+)</a>', 'posting-title'),
        (r'href="(/\w+/\d+\.html)"[^>]*>([^<]+)</a>', 'basic href'),
        (r'<a[^>]*href="([^"]*\d+\.html)"', 'any .html link'),
    ]
    
    for pattern, desc in patterns:
        matches = re.findall(pattern, html)
        print(f"\n{desc}: Found {len(matches)} matches")
        for m in matches[:3]:
            if isinstance(m, tuple):
                print(f"  - {m}")
            else:
                print(f"  - {m}")
    
    # Check if page has any listings at all
    if 'cl-static-search-result' in html:
        print("\nFound 'cl-static-search-result' class")
    if 'posting-title' in html:
        print("Found 'posting-title' class")
    if 'result' in html.lower():
        print("Page contains 'result' keyword")
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
