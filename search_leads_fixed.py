import urllib.request
import urllib.parse
import re
import json
from datetime import datetime, timedelta

def search_craigslist_direct(keywords):
    """Search Craigslist directly with proper encoding"""
    base_url = 'https://chicago.craigslist.org/search/bbb'
    
    all_results = []
    
    for keyword in keywords:
        url = f'{base_url}?query={urllib.parse.quote(keyword)}&sort=newest'
        print(f"Fetching: {keyword}...")
        
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0'
            })
            
            with urllib.request.urlopen(req, timeout=15) as response:
                html = response.read().decode('utf-8', errors='ignore')
                
                # Try to extract JSON-LD data
                json_match = re.search(r'id="ld_searchpage_results"[^>]*>({[\s\S]*?})</script>', html)
                
                if json_match:
                    try:
                        data = json.loads(json_match.group(1))
                        items = data.get('itemListElement', [])
                        
                        print(f"  Found {len(items)} results for '{keyword}'")
                        
                        for item in items[:3]:  # Get top 3 results
                            if isinstance(item, dict) and 'item' in item:
                                post = item['item']
                                result = {
                                    'title': post.get('name', ''),
                                    'description': post.get('description', ''),
                                    'url': post.get('url', ''),
                                    'keyword': keyword,
                                    'platform': 'Craigslist'
                                }
                                
                                # Extract price if available
                                if 'offers' in post and isinstance(post['offers'], dict):
                                    result['price'] = post['offers'].get('price', 'Not specified')
                                    # Extract location
                                    if 'availableAtOrFrom' in post['offers']:
                                        location_data = post['offers']['availableAtOrFrom']
                                        if isinstance(location_data, dict) and 'address' in location_data:
                                            addr = location_data['address']
                                            if isinstance(addr, dict):
                                                result['city'] = addr.get('addressLocality', '')
                                
                                all_results.append(result)
                                print(f"    - {result['title'][:60]}")
                        
                    except json.JSONDecodeError:
                        print(f"  Could not parse JSON for {keyword}")
                else:
                    print(f"  No JSON data found for {keyword}")
                    
        except Exception as e:
            print(f"  Error: {e}")
    
    return all_results

# Keywords to search
keywords = [
    'kitchen remodel',
    'bathroom remodel',
    'siding contractor',
    'flooring',
    'painting service',
    'handyman',
    'drywall',
    'plumbing',
    'home renovation',
    'general contractor'
]

print("Searching Craigslist Chicago for construction leads...\n")

leads = search_craigslist_direct(keywords)

# Remove duplicates by URL
seen = set()
unique_leads = []
for lead in leads:
    if lead['url'] and lead['url'] not in seen:
        seen.add(lead['url'])
        unique_leads.append(lead)

print(f"\n\n{'='*70}")
print(f"TOTAL UNIQUE LEADS FOUND: {len(unique_leads)}")
print(f"{'='*70}\n")

# Format results
for idx, lead in enumerate(unique_leads, 1):
    print(f"{idx}. TITLE: {lead.get('title', 'N/A')}")
    print(f"   PLATFORM: {lead.get('platform', 'N/A')}")
    print(f"   KEYWORD MATCHED: {lead.get('keyword', 'N/A')}")
    if lead.get('city'):
        print(f"   LOCATION: {lead['city']}")
    if lead.get('price'):
        print(f"   BUDGET: {lead['price']}")
    if lead.get('description'):
        print(f"   NOTES: {lead['description'][:100]}")
    print(f"   URL: {lead.get('url', 'N/A')}")
    print()

# Save to file
output = {
    'timestamp': datetime.now().isoformat(),
    'total_leads': len(unique_leads),
    'leads': unique_leads
}

with open('C:/Users/trisd/clawd/construction_leads.json', 'w') as f:
    json.dump(output, f, indent=2)
    print(f"Saved {len(unique_leads)} leads to construction_leads.json")
