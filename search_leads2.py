import urllib.request
import urllib.parse
import re
from datetime import datetime, timedelta

# Search both "services offered" and general postings
search_urls = [
    # Services offered by contractors
    'https://chicago.craigslist.org/search/bbb?query=kitchen+remodel&sort=newest',
    'https://chicago.craigslist.org/search/bbb?query=bathroom+remodel&sort=newest',
    'https://chicago.craigslist.org/search/bbb?query=siding&sort=newest',
    'https://chicago.craigslist.org/search/bbb?query=flooring&sort=newest',
    'https://chicago.craigslist.org/search/bbb?query=painting&sort=newest',
    'https://chicago.craigslist.org/search/bbb?query=handyman&sort=newest',
    # Try general section with these keywords (people asking for help)
    'https://chicago.craigslist.org/d/services/search/sss?query=kitchen+remodel+help&sort=newest',
    'https://chicago.craigslist.org/d/services/search/sss?query=need+contractor&sort=newest',
]

all_leads = []

for search_url in search_urls:
    try:
        print(f"\nSearching: {search_url.split('query=')[1] if 'query=' in search_url else 'unknown'}")
        req = urllib.request.Request(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Look for result rows - Craigslist uses specific HTML structure
            # Pattern: <a ... href="/...(posting ID)..." ...>Title</a>
            # Look for list items with specific classes
            result_pattern = r'<span class="result-meta">.*?<a[^>]*href="(/[a-z]{3}/\d+\.html)"[^>]*>([^<]+)</a>'
            
            matches = re.findall(result_pattern, html, re.DOTALL)
            
            if matches:
                print(f"  Found {len(matches)} results")
                for url_path, title in matches[:3]:
                    full_url = 'https://chicago.craigslist.org' + url_path
                    lead_data = {
                        'title': title.strip(),
                        'url': full_url,
                        'search_query': search_url.split('query=')[1] if 'query=' in search_url else 'unknown'
                    }
                    all_leads.append(lead_data)
                    print(f"    - {title.strip()[:60]}")
            else:
                # Try alternative pattern
                alt_pattern = r'data-id="(\d+)".*?<a[^>]*href="([^"]*)"[^>]*title="([^"]*)"'
                alt_matches = re.findall(alt_pattern, html, re.DOTALL)
                if alt_matches:
                    print(f"  Found {len(alt_matches)} results (alt pattern)")
                    for post_id, url_path, title in alt_matches[:3]:
                        lead_data = {
                            'title': title.strip(),
                            'url': url_path if url_path.startswith('http') else 'https://chicago.craigslist.org' + url_path,
                            'id': post_id,
                            'search_query': search_url.split('query=')[1] if 'query=' in search_url else 'unknown'
                        }
                        all_leads.append(lead_data)
                        print(f"    - {title.strip()[:60]}")
                else:
                    print(f"  No results found")
                    # Print first 1000 chars to debug
                    print("HTML snippet:", html[:1000])
                    
    except Exception as e:
        print(f'Error: {e}')

print(f"\n\n=== TOTAL UNIQUE LEADS COLLECTED: {len(all_leads)} ===\n")

# Remove duplicates by URL
seen_urls = set()
unique_leads = []
for lead in all_leads:
    if lead['url'] not in seen_urls:
        seen_urls.add(lead['url'])
        unique_leads.append(lead)

for idx, lead in enumerate(unique_leads[:10], 1):
    print(f"{idx}. {lead['title'][:70]}")
    print(f"   URL: {lead['url']}")
    print(f"   Query: {lead['search_query']}")
    print()
