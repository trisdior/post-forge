import urllib.request
import re
import json
from datetime import datetime, timedelta

def search_google_craigslist(search_query):
    """Use Google search to find recent Craigslist posts"""
    # URL-encode the query to search Craigslist Chicago for construction services
    search_url = f'https://www.google.com/search?q=site:chicago.craigslist.org+{search_query}&tbm=&tbs=qdr:d'  # last 24 hours
    
    try:
        req = urllib.request.Request(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract Craigslist URLs from Google results
            craigslist_pattern = r'href="(https://chicago\.craigslist\.org/[^"]*)"'
            urls = re.findall(craigslist_pattern, html)
            
            results = []
            for url in urls:
                # Remove Google tracking parameters
                clean_url = url.split('&')[0]
                results.append(clean_url)
            
            return results[:5]  # Get first 5 results
            
    except Exception as e:
        print(f'Error searching Google for {search_query}: {e}')
        return []

def extract_post_info(post_url):
    """Extract information from a Craigslist post"""
    try:
        req = urllib.request.Request(post_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            lead = {'url': post_url}
            
            # Extract title
            title_match = re.search(r'<title>([^<]+) - ([^<]+)</title>', html)
            if title_match:
                lead['title'] = title_match.group(1)
                
            # Extract price if available
            price_match = re.search(r'<span class="price">([^<]+)</span>', html)
            if price_match:
                lead['price'] = price_match.group(1)
                
            # Extract posted date
            date_match = re.search(r'posted (\d+ (minutes|hours|days) ago)', html)
            if date_match:
                lead['posted'] = date_match.group(1)
            
            # Extract contact info if visible
            phone_match = re.search(r'(\d{3}[- ]?\d{3}[- ]?\d{4})', html)
            if phone_match:
                lead['phone'] = phone_match.group(1)
                
            return lead
            
    except Exception as e:
        return {'url': post_url, 'error': str(e)}

# Alternative: Try Facebook search
print("Attempting to find Chicago construction leads...")
print("Note: This may have limited results due to web scraping restrictions.\n")

# Search queries matching Valencia Construction services
search_queries = [
    'chicago kitchen remodel looking',
    'chicago bathroom remodel needed',
    'chicago siding contractor',
    'chicago flooring installation',
    'chicago house painting',
    'chicago handyman services',
    'chicago drywall repair',
    'chicago plumbing help',
    'chicago contractor needed'
]

all_leads = []

print("Searching Google for Craigslist posts (last 24 hours)...")
for query in search_queries:
    print(f"  {query}...", end='')
    urls = search_google_craigslist(query)
    if urls:
        print(f" found {len(urls)}")
        for url in urls:
            print(f"    Extracting from: {url[:60]}...")
            post_info = extract_post_info(url)
            all_leads.append(post_info)
    else:
        print(" (no results)")

print(f"\n=== LEADS FOUND: {len(all_leads)} ===\n")

for idx, lead in enumerate(all_leads[:10], 1):
    print(f"{idx}. Title: {lead.get('title', 'N/A')}")
    if 'posted' in lead:
        print(f"   Posted: {lead['posted']}")
    if 'price' in lead:
        print(f"   Budget: {lead['price']}")
    if 'phone' in lead:
        print(f"   Contact: {lead['phone']}")
    print(f"   URL: {lead['url']}")
    print()

# Save results
with open('C:/Users/trisd/clawd/leads_found.json', 'w') as f:
    json.dump(all_leads, f, indent=2)
    print(f"Results saved to leads_found.json")
