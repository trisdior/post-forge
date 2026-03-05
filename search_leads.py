import urllib.request
import urllib.parse
import re
import json
from datetime import datetime, timedelta
from html.parser import HTMLParser

class CraigslistParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.results = []
        self.current_id = None
        self.current_title = None
        self.current_url = None
        self.current_price = None
        self.current_date = None
        self.in_result = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a' and 'data-id' in attrs_dict and 'href' in attrs_dict:
            self.in_result = True
            self.current_id = attrs_dict['data-id']
            self.current_url = 'https://chicago.craigslist.org' + attrs_dict['href']
            self.current_title = None
            
    def handle_data(self, data):
        if self.in_result and self.current_title is None:
            text = data.strip()
            if text:
                self.current_title = text
                
    def handle_endtag(self, tag):
        if tag == 'a' and self.in_result and self.current_title:
            self.results.append({
                'id': self.current_id,
                'title': self.current_title,
                'url': self.current_url
            })
            self.in_result = False

# Search Chicago services
search_terms = {
    'kitchen remodel': 'kitchen+remodel',
    'bathroom remodel': 'bathroom+remodel', 
    'siding': 'siding',
    'flooring': 'flooring',
    'painting': 'painting',
    'handyman': 'handyman',
    'drywall': 'drywall',
    'plumbing': 'plumbing',
    'general contractor': 'general+contractor'
}

all_leads = []

for category, query in search_terms.items():
    # Services section - looking for people requesting services (bbb = services)
    url = f'https://chicago.craigslist.org/search/bbb?query={query}&sort=newest'
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract data from JSON-LD format
            json_match = re.search(r'id="ld_searchpage_results"[^>]*>({.*?})</script>', html, re.DOTALL)
            if json_match:
                try:
                    json_data = json.loads(json_match.group(1))
                    items = json_data.get('itemListElement', [])
                    
                    print(f"\n=== {category.upper()} - Found {len(items)} results ===")
                    
                    for idx, item in enumerate(items[:5]):  # Get first 5 results
                        if 'item' in item:
                            post_item = item['item']
                            title = post_item.get('name', 'N/A')
                            description = post_item.get('description', '')
                            url_from_item = post_item.get('url', 'N/A')
                            
                            # Try to extract contact info or posting date
                            lead = {
                                'title': title,
                                'category': category,
                                'platform': 'Craigslist',
                                'url': url_from_item,
                                'description': description[:200] if description else 'No description'
                            }
                            
                            all_leads.append(lead)
                            print(f"  [{idx+1}] {title}")
                            if description:
                                print(f"       Desc: {description[:100]}")
                                
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON for {category}: {e}")
            else:
                print(f"No JSON-LD data found for {category}")
                    
    except Exception as e:
        print(f'Error searching {category}: {e}')

print(f"\n\n=== TOTAL LEADS FOUND: {len(all_leads)} ===")
for lead in all_leads[:10]:
    print(f"\nTitle: {lead['title']}")
    print(f"Category: {lead['category']}")
    print(f"Platform: {lead['platform']}")
