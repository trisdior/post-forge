import urllib.request
import json
import re
from datetime import datetime, timedelta

def search_craigslist_services(keyword):
    """Search Craigslist services section and extract leads"""
    url = f'https://chicago.craigslist.org/search/bbb?query={keyword}&sort=newest'
    
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract JSON-LD search results
            json_pattern = r'id="ld_searchpage_results"[^>]*>({.*?})</script>'
            json_match = re.search(json_pattern, html, re.DOTALL)
            
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    items = data.get('itemListElement', [])
                    
                    leads = []
                    for item in items:
                        if 'item' in item:
                            post = item['item']
                            lead = {
                                'title': post.get('name', 'N/A'),
                                'description': post.get('description', 'N/A'),
                                'url': post.get('url', 'N/A'),
                                'price': post.get('offers', {}).get('price', 'N/A') if isinstance(post.get('offers'), dict) else 'N/A',
                                'location': None,
                                'keyword': keyword
                            }
                            
                            # Extract location if available
                            location_data = post.get('offers', {})
                            if isinstance(location_data, dict):
                                location_info = location_data.get('availableAtOrFrom', {})
                                if isinstance(location_info, dict):
                                    address = location_info.get('address', {})
                                    if isinstance(address, dict):
                                        city = address.get('addressLocality', '')
                                        if city:
                                            lead['location'] = city
                            
                            leads.append(lead)
                    
                    return leads
                except json.JSONDecodeError as e:
                    print(f"JSON parsing error for {keyword}: {e}")
                    return []
            else:
                # Try to get raw HTML structure
                print(f"No JSON data for {keyword}, trying HTML parsing...")
                return []
                
    except Exception as e:
        print(f'Error searching {keyword}: {e}')
        return []

# Main search
keywords = [
    'kitchen+remodel',
    'bathroom+remodel',
    'home+remodel',
    'siding',
    'flooring',
    'painting',
    'drywall',
    'plumbing',
    'handyman',
    'general+contractor'
]

all_leads = []

for keyword in keywords:
    print(f"Searching: {keyword}")
    leads = search_craigslist_services(keyword)
    all_leads.extend(leads)
    print(f"  Found {len(leads)} leads")

# Remove duplicates
seen = set()
unique_leads = []
for lead in all_leads:
    key = lead['url']
    if key not in seen:
        seen.add(key)
        unique_leads.append(lead)

print(f"\n=== TOTAL LEADS: {len(unique_leads)} ===\n")

for idx, lead in enumerate(unique_leads[:15], 1):
    print(f"{idx}. Title: {lead['title'][:70]}")
    if lead['location']:
        print(f"   Location: {lead['location']}")
    if lead['price'] != 'N/A':
        print(f"   Price: {lead['price']}")
    print(f"   Keyword: {lead['keyword']}")
    print(f"   URL: {lead['url'][:80]}")
    print()
