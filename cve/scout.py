#!/usr/bin/env python3
"""
Scout Agent — Christopher Valencia Enterprises
Scans X, Reddit, TikTok, HackerNews for:
- Pain points people express
- Products/services people complain about
- Market gaps (things people wish existed)
- Trends gaining momentum
- Competitor weaknesses

Outputs opportunity cards to analyst pipeline.
"""

import requests
import json
import os
import re
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

OPPORTUNITY_FILE = os.path.join(DATA_DIR, "opportunities.json")
SEEN_FILE = os.path.join(DATA_DIR, "seen.json")

# Pain point keywords — signals someone has a problem worth solving
PAIN_SIGNALS = [
    "i wish there was", "why isn't there", "someone should build",
    "i'd pay for", "so frustrated with", "there has to be a better way",
    "worst experience with", "can't believe there's no", "looking for alternative to",
    "switched from", "nothing works for", "tired of", "hate how",
    "why is it so hard to", "anyone know a tool that", "need a better",
    "is there an app", "recommendation for", "alternative to",
    "broken", "sucks", "terrible", "unusable", "overpriced",
    "wish this existed", "somebody needs to make", "how is there no",
    "would kill for", "take my money", "shut up and take my money",
    "why does every", "can't find a good", "the problem with",
]

# Opportunity categories
CATEGORIES = [
    "saas", "mobile_app", "chrome_extension", "api", "marketplace",
    "content_tool", "dev_tool", "ai_tool", "automation", "fintech",
    "health", "productivity", "social", "ecommerce", "education"
]


class Scout:
    def __init__(self):
        self.opportunities = self.load_json(OPPORTUNITY_FILE, [])
        self.seen = self.load_json(SEEN_FILE, [])

    def load_json(self, path, default):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def scan_reddit(self, subreddits=None):
        """Scan Reddit for pain points and opportunities"""
        if subreddits is None:
            subreddits = [
                "SaaS", "startups", "Entrepreneur", "smallbusiness",
                "webdev", "programming", "productivity", "apps",
                "ArtificialIntelligence", "ChatGPT", "LocalLLaMA",
                "sideproject", "indiehackers", "marketing",
                "freelance", "RemoteWork", "software",
                "technology", "apple", "android",
            ]

        opportunities = []
        headers = {"User-Agent": "CVE-Scout/1.0"}

        for sub in subreddits:
            try:
                url = f"https://www.reddit.com/r/{sub}/hot.json?limit=50"
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code != 200:
                    continue

                posts = response.json().get("data", {}).get("children", [])
                for post in posts:
                    data = post.get("data", {})
                    title = data.get("title", "").lower()
                    selftext = data.get("selftext", "").lower()
                    combined = title + " " + selftext
                    post_id = data.get("id")

                    if post_id in self.seen:
                        continue

                    # Check for pain signals
                    matched_signals = []
                    for signal in PAIN_SIGNALS:
                        if signal in combined:
                            matched_signals.append(signal)

                    if matched_signals:
                        score = len(matched_signals) * 10 + data.get("score", 0)
                        opp = {
                            "id": post_id,
                            "source": "reddit",
                            "subreddit": sub,
                            "title": data.get("title", ""),
                            "url": f"https://reddit.com{data.get('permalink', '')}",
                            "upvotes": data.get("score", 0),
                            "comments": data.get("num_comments", 0),
                            "signals": matched_signals,
                            "score": score,
                            "snippet": data.get("selftext", "")[:500],
                            "found_at": datetime.now().isoformat(),
                            "status": "new",
                        }
                        opportunities.append(opp)
                        self.seen.append(post_id)

            except Exception as e:
                print(f"[SCOUT] Error scanning r/{sub}: {e}")

        return opportunities

    def scan_hackernews(self):
        """Scan HackerNews for tech opportunities"""
        opportunities = []
        try:
            # Get top and new stories
            for endpoint in ["topstories", "newstories", "askstories", "showstories"]:
                url = f"https://hacker-news.firebaseio.com/v0/{endpoint}.json"
                response = requests.get(url, timeout=10)
                if response.status_code != 200:
                    continue

                story_ids = response.json()[:30]  # Top 30

                for story_id in story_ids:
                    if str(story_id) in self.seen:
                        continue

                    item_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                    item = requests.get(item_url, timeout=5).json()
                    if not item:
                        continue

                    title = (item.get("title") or "").lower()
                    text = (item.get("text") or "").lower()
                    combined = title + " " + text

                    matched_signals = []
                    for signal in PAIN_SIGNALS:
                        if signal in combined:
                            matched_signals.append(signal)

                    if matched_signals or item.get("score", 0) > 100:
                        score = len(matched_signals) * 10 + (item.get("score", 0) // 10)
                        opp = {
                            "id": str(story_id),
                            "source": "hackernews",
                            "title": item.get("title", ""),
                            "url": item.get("url", f"https://news.ycombinator.com/item?id={story_id}"),
                            "upvotes": item.get("score", 0),
                            "comments": item.get("descendants", 0),
                            "signals": matched_signals,
                            "score": score,
                            "snippet": (item.get("text") or "")[:500],
                            "found_at": datetime.now().isoformat(),
                            "status": "new",
                        }
                        opportunities.append(opp)
                        self.seen.append(str(story_id))

        except Exception as e:
            print(f"[SCOUT] Error scanning HN: {e}")

        return opportunities

    def run(self):
        """Full scan across all platforms"""
        print(f"[SCOUT] Starting scan at {datetime.now().isoformat()}")

        all_opportunities = []

        # Reddit scan
        print("[SCOUT] Scanning Reddit...")
        reddit_opps = self.scan_reddit()
        all_opportunities.extend(reddit_opps)
        print(f"[SCOUT] Found {len(reddit_opps)} Reddit opportunities")

        # HackerNews scan
        print("[SCOUT] Scanning HackerNews...")
        hn_opps = self.scan_hackernews()
        all_opportunities.extend(hn_opps)
        print(f"[SCOUT] Found {len(hn_opps)} HN opportunities")

        # Sort by score
        all_opportunities.sort(key=lambda x: x["score"], reverse=True)

        # Save
        self.opportunities.extend(all_opportunities)
        self.save_json(OPPORTUNITY_FILE, self.opportunities)
        self.save_json(SEEN_FILE, self.seen)

        print(f"[SCOUT] Total: {len(all_opportunities)} new opportunities found")
        print(f"[SCOUT] Top 5:")
        for i, opp in enumerate(all_opportunities[:5], 1):
            print(f"  {i}. [{opp['source']}] {opp['title']} (score: {opp['score']})")
            print(f"     Signals: {', '.join(opp['signals'][:3])}")
            print(f"     URL: {opp['url']}")

        return all_opportunities


if __name__ == "__main__":
    scout = Scout()
    results = scout.run()
