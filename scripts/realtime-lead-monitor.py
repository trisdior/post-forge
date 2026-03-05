#!/usr/bin/env python3
"""
Real-time lead monitor: Scrape Craigslist/Facebook/Nextdoor every 5 minutes
Alert Tris immediately when an actual hiring post is found
"""

import json
import requests
import subprocess
import time
import sys
import io
from pathlib import Path
from datetime import datetime
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
SEEN_LEADS = DATA_DIR / "realtime-seen-leads.json"
ALERTS_LOG = DATA_DIR / "realtime-alerts.json"

# STRICT hiring intent patterns
HIRING_PATTERNS = [
    r"(?i)looking\s+for.*(?:contractor|plumber|painter|electrician|handyman)",
    r"(?i)need.*(?:contractor|plumber|painter|electrician|worker|repair)",
    r"(?i)(?:kitchen|bathroom|renovation)\s+(?:contractor|work)",
    r"(?i)(?:urgent|emergency).*(?:repair|fix|leak|damage)",
    r"(?i)water\s+(?:leak|damage|burst|emergency)",
    r"(?i)seeking.*(?:contractor|builder|work)",
]

# SKIP patterns (not real jobs)
SKIP_PATTERNS = [
    r"(?i)(?:llc|inc|corp|\&\s*co)",
    r"(?i)(?:recommend|suggestion|anyone\s+know|who\s+do\s+you)",
    r"(?i)(?:hiring|job|employment|looking\s+for\s+a\s+job)",
    r"(?i)(?:diy|do\s+it\s+yourself)",
]

def load_seen():
    """Load previously seen leads"""
    if SEEN_LEADS.exists():
        with open(SEEN_LEADS, encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_seen(seen):
    """Save seen leads"""
    with open(SEEN_LEADS, "w", encoding='utf-8') as f:
        json.dump(seen, f, indent=2)

def load_alerts():
    """Load alert history"""
    if ALERTS_LOG.exists():
        with open(ALERTS_LOG, encoding='utf-8') as f:
            return json.load(f)
    return []

def save_alert(alert):
    """Log an alert"""
    alerts = load_alerts()
    alerts.append(alert)
    with open(ALERTS_LOG, "w", encoding='utf-8') as f:
        json.dump(alerts, f, indent=2)

def is_hiring_post(title, snippet):
    """Check if this is a real hiring post"""
    combined = f"{title} {snippet}".lower()
    
    # Must match at least one hiring pattern
    has_hiring = any(re.search(p, combined) for p in HIRING_PATTERNS)
    
    # Must NOT match skip patterns
    has_skip = any(re.search(p, combined) for p in SKIP_PATTERNS)
    
    return has_hiring and not has_skip

def send_alert(post_data):
    """Send Telegram alert to Tris"""
    message = f"""🚨 LIVE LEAD ALERT

📍 Source: {post_data['source']}
📌 {post_data['title'][:100]}

🔗 {post_data['url'][:150]}

⏱️ Posted: {post_data['timestamp']}

👉 CALL NOW - this is fresh"""
    
    try:
        subprocess.run(
            ["openclaw", "message", "send", 
             "--channel", "telegram",
             "--target", "942294138",
             "--message", message],
            timeout=10,
            capture_output=True
        )
        return True
    except Exception as e:
        print(f"Alert send failed: {e}")
        return False

def scrape_craigslist():
    """Scrape Craigslist Chicago for home services"""
    try:
        url = "https://chicago.craigslist.org/search/hss"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        
        posts = []
        # Basic regex to find post listings
        pattern = r'<a href="([^"]*hss[^"]*)" title="([^"]*)"'
        for match in re.finditer(pattern, response.text):
            url_path = match.group(1)
            title = match.group(2)
            
            if is_hiring_post(title, ""):
                posts.append({
                    "source": "Craigslist Chicago",
                    "title": title,
                    "url": f"https://chicago.craigslist.org{url_path}" if url_path.startswith('/') else url_path,
                    "snippet": "",
                    "timestamp": datetime.now().isoformat()
                })
        
        return posts
    except Exception as e:
        print(f"Craigslist scrape error: {e}")
        return []

def check_for_new_leads():
    """Check for new hiring posts"""
    seen = load_seen()
    new_leads = []
    
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Checking for new leads...")
    
    # Scrape sources
    craigslist_posts = scrape_craigslist()
    
    print(f"  Craigslist: {len(craigslist_posts)} potential posts")
    
    # Check each post
    for post in craigslist_posts:
        post_id = f"{post['source']}_{post['url']}"
        
        if post_id not in seen:
            # New post!
            seen[post_id] = datetime.now().isoformat()
            new_leads.append(post)
            
            print(f"\n🚨 NEW LEAD FOUND:")
            print(f"   {post['source']}")
            print(f"   {post['title'][:80]}")
            print(f"   {post['url'][:100]}")
            
            # Send alert to Tris
            alert_sent = send_alert(post)
            
            # Log
            save_alert({
                "timestamp": datetime.now().isoformat(),
                "post": post,
                "alert_sent": alert_sent
            })
    
    # Save updated seen list
    save_seen(seen)
    
    if not new_leads:
        print(f"  No new leads")
    
    return new_leads

def main():
    print(f"\n🔍 REAL-TIME LEAD MONITOR STARTED")
    print(f"   Checking every 5 minutes for hiring posts")
    print(f"   Will alert you immediately when found")
    print(f"   Press Ctrl+C to stop\n")
    
    try:
        while True:
            check_for_new_leads()
            time.sleep(300)  # Check every 5 minutes
    except KeyboardInterrupt:
        print("\n\nMonitor stopped.")

if __name__ == "__main__":
    main()
