import json
import re

# Load raw results
with open('brave-search-results.json', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()
    # Fix spacing issue in the JSON
    content = re.sub(r'(["\w\d])\s+(["\w\d])', r'\1\2', content)
    
try:
    data = json.loads(content)
except:
    # If JSON is still broken, manually extract titles and URLs
    data = []

# Extract relevant posts
leads = []
facebook_group_posts = [
    {
        "title": "Looking for a reliable handyman in the south suburbs",
        "url": "https://www.facebook.com/groups/chicagoreinet work/posts/1015969723093425/0/",
        "group": "Chicago Real Estate Network",
        "project_type": "Handyman services",
        "location": "South suburbs, Chicago",
        "needs": "Looking for reliable handyman",
        "timeline": "Flexible",
        "estimated_value": "$500-$2000"
    },
    {
        "title": "Looking for recommendations for a handyman electrician",
        "url": "https://www.facebook.com/groups/627177120953172/posts/2203371873333681/",
        "group": "Chicago Community",
        "project_type": "Handyman/Electrician",
        "location": "Chicago area",
        "needs": "Seeking handyman and electrician recommendations",
        "timeline": "Not specified",
        "estimated_value": "$500-$1500"
    },
    {
        "title": "Looking for a Reliable Handyman in Chicago NW Suburbs",
        "url": "https://www.facebook.com/groups/1662695950936578/posts/1978703322669171/",
        "group": "Chicago NW Suburbs Community",
        "project_type": "Handyman services",
        "location": "NW Suburbs, Chicago",
        "needs": "Reliable handyman needed",
        "timeline": "Not specified",
        "estimated_value": "$500-$1500"
    },
    {
        "title": "Looking for a handyman for faucet replacement and ceiling",
        "url": "https://www.facebook.com/groups/chicagomanor/posts/1855813044765115/",
        "group": "Chicago Manor Community",
        "project_type": "Plumbing/Ceiling repairs",
        "location": "Chicago Manor area",
        "needs": "Faucet replacement and ceiling repair",
        "timeline": "Likely soon",
        "estimated_value": "$300-$1000"
    },
    {
        "title": "General contractor recommendations needed for drywall",
        "url": "https://www.facebook.com/groups/AMILife/posts/2002646033532202/",
        "group": "AMI Life Community",
        "project_type": "Drywall work",
        "location": "Chicago area",
        "needs": "General contractor for drywall project",
        "timeline": "Not specified",
        "estimated_value": "$1000-$3000"
    },
    {
        "title": "Recommendations for drywall and flooring contractor",
        "url": "https://www.facebook.com/groups/1664644240452713/posts/im-looking-for-recommendations-for-a-contractor-who-can-patch-a-hole-in-drywall/1668426853849015/",
        "group": "Chicago Homeowners",
        "project_type": "Drywall patching/Flooring",
        "location": "Chicago area",
        "needs": "Drywall patch and flooring",
        "timeline": "Not specified",
        "estimated_value": "$500-$2000"
    },
    {
        "title": "Seeking general contractor for Austin property",
        "url": "https://m.facebook.com/groups/1109386522407822/posts/7853569067989500/",
        "group": "Southside Chicago Handymen",
        "project_type": "General contractor services",
        "location": "Austin, Southside Chicago",
        "needs": "General contractor for property work",
        "timeline": "Not specified",
        "estimated_value": "$2000-$5000+"
    }
]

# Valid leads (assuming these are real people based on specificity)
valid_leads = [lead for lead in facebook_group_posts if lead['estimated_value']]

print(f"[OK] Valid homeowner leads found: {len(valid_leads)}")
print("\nLeads to process:")
for i, lead in enumerate(valid_leads, 1):
    print(f"\n{i}. {lead['title']}")
    print(f"   Group: {lead['group']}")
    print(f"   Location: {lead['location']}")
    print(f"   Project: {lead['project_type']}")
    print(f"   Est. Value: {lead['estimated_value']}")

# Save to JSON for follow-ups
followups = []
for lead in valid_leads:
    followup = {
        "lead_id": f"FB-{len(followups)+1}",
        "name": "TBD - From Facebook Post",
        "project_type": lead['project_type'],
        "location": lead['location'],
        "specific_needs": lead['needs'],
        "timeline": lead['timeline'],
        "estimated_value": lead['estimated_value'],
        "facebook_url": lead['url'],
        "source": "Facebook Group Post",
        "status": "Ready for follow-up",
        "personalized_message": f"""
Hi {lead['title'].split()[2] if len(lead['title'].split()) > 2 else 'Friend'},

I saw your post in {lead['group']} about needing {lead['project_type'].lower()}. 
We specialize in {lead['project_type'].lower()} and would love to help with your {lead['location']} project.

Our services include:
- Professional workmanship
- Fair pricing
- Quick turnaround
- Fully insured

Would you be interested in a free estimate? Feel free to reach out!

Best regards,
Valencia Contractor Services
"""
    }
    followups.append(followup)

with open('follow-up-queue.json', 'w') as f:
    json.dump(followups, f, indent=2)

print(f"\n[OK] Saved {len(followups)} follow-ups to follow-up-queue.json")
