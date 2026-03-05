import json
import sys

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\trisd\clawd\data\facebook-leads-latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'C:\Users\trisd\clawd\data\agent-queue.json', 'r', encoding='utf-8') as f:
    queue = json.load(f)

# Find the Facebook leads in queue
fb_leads = [q for q in queue if q['source'] == 'facebook']
print('=== Looking for Facebook leads in data ===\n')

for lead in fb_leads:
    print(f"Lead: {lead['leadName']}")
    print(f"URL: {lead['postUrl']}")
    
    # Try to find in facebook-leads-latest
    match = [p for p in data.get('posts', []) if lead['postUrl'] in p.get('url', '')]
    if match:
        m = match[0]
        print(f"[FOUND] in facebook-leads-latest.json")
        print(f"  Title/Post: {m.get('title', 'N/A')}")
        print(f"  Author: {m.get('author', 'N/A')}")
        print(f"  Group: {m.get('groupName', 'N/A')}")
        print(f"  Snippet: {m.get('snippet', 'N/A')}")
    else:
        print(f"[NOT FOUND] in facebook-leads-latest.json")
    print()
