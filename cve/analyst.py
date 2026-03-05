#!/usr/bin/env python3
"""
Analyst Agent — Christopher Valencia Enterprises
Takes opportunities from Scout, analyzes:
- Market size / demand signals
- Existing competitors + their weaknesses
- Build difficulty (can agents ship an MVP in 24-48h?)
- Revenue potential
- "Winability" score (can we beat the competition?)

Outputs scored opportunity cards to Builder queue.
"""

import json
import os
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

OPPORTUNITY_FILE = os.path.join(DATA_DIR, "opportunities.json")
ANALYSIS_FILE = os.path.join(DATA_DIR, "analyzed.json")
BUILD_QUEUE_FILE = os.path.join(DATA_DIR, "build-queue.json")


class Analyst:
    def __init__(self):
        self.opportunities = self.load_json(OPPORTUNITY_FILE, [])
        self.analyzed = self.load_json(ANALYSIS_FILE, [])
        self.build_queue = self.load_json(BUILD_QUEUE_FILE, [])

    def load_json(self, path, default):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def score_opportunity(self, opp):
        """Score an opportunity on multiple dimensions"""
        scores = {}

        # Demand signal (upvotes + comments = people care)
        engagement = opp.get("upvotes", 0) + opp.get("comments", 0)
        if engagement > 500:
            scores["demand"] = 10
        elif engagement > 100:
            scores["demand"] = 7
        elif engagement > 20:
            scores["demand"] = 5
        else:
            scores["demand"] = 3

        # Pain intensity (more signals = bigger pain)
        signal_count = len(opp.get("signals", []))
        if signal_count >= 3:
            scores["pain"] = 10
        elif signal_count >= 2:
            scores["pain"] = 7
        else:
            scores["pain"] = 4

        # Buildability (can agents ship this in 24-48h?)
        # Heuristic: web apps, chrome extensions, APIs = easy
        # Mobile apps, hardware = harder
        title_lower = opp.get("title", "").lower()
        snippet_lower = opp.get("snippet", "").lower()
        combined = title_lower + " " + snippet_lower

        easy_signals = ["website", "app", "tool", "extension", "bot", "api",
                       "dashboard", "saas", "automation", "script", "plugin"]
        hard_signals = ["hardware", "physical", "manufacturing", "medical",
                       "legal", "regulated", "government"]

        easy_count = sum(1 for s in easy_signals if s in combined)
        hard_count = sum(1 for s in hard_signals if s in combined)

        if easy_count > 0 and hard_count == 0:
            scores["buildability"] = 9
        elif hard_count > 0:
            scores["buildability"] = 3
        else:
            scores["buildability"] = 6

        # Revenue potential
        money_signals = ["pay", "subscription", "pricing", "cost", "expensive",
                        "cheap", "free", "premium", "enterprise", "business"]
        money_count = sum(1 for s in money_signals if s in combined)
        scores["revenue"] = min(10, 4 + money_count * 2)

        # Overall winability
        total = sum(scores.values())
        max_possible = 40
        scores["overall"] = round((total / max_possible) * 100)

        return scores

    def analyze(self, opp):
        """Full analysis of a single opportunity"""
        scores = self.score_opportunity(opp)

        analysis = {
            "id": opp["id"],
            "source": opp["source"],
            "title": opp["title"],
            "url": opp["url"],
            "scores": scores,
            "overall_score": scores["overall"],
            "recommendation": "BUILD" if scores["overall"] >= 65 else "WATCH" if scores["overall"] >= 45 else "SKIP",
            "analyzed_at": datetime.now().isoformat(),
            "signals": opp.get("signals", []),
            "engagement": {
                "upvotes": opp.get("upvotes", 0),
                "comments": opp.get("comments", 0),
            },
            "snippet": opp.get("snippet", "")[:300],
        }

        return analysis

    def run(self):
        """Analyze all new opportunities"""
        print(f"[ANALYST] Starting analysis at {datetime.now().isoformat()}")

        new_opps = [o for o in self.opportunities if o.get("status") == "new"]
        print(f"[ANALYST] {len(new_opps)} opportunities to analyze")

        results = []
        build_candidates = []

        for opp in new_opps:
            analysis = self.analyze(opp)
            results.append(analysis)
            opp["status"] = "analyzed"

            if analysis["recommendation"] == "BUILD":
                build_candidates.append(analysis)
                print(f"  BUILD: {analysis['title']} (score: {analysis['overall_score']})")
            elif analysis["recommendation"] == "WATCH":
                print(f"  WATCH: {analysis['title']} (score: {analysis['overall_score']})")

        # Save analyzed results
        self.analyzed.extend(results)
        self.save_json(ANALYSIS_FILE, self.analyzed)

        # Add BUILD recommendations to build queue
        self.build_queue.extend(build_candidates)
        self.save_json(BUILD_QUEUE_FILE, self.build_queue)

        # Update opportunity statuses
        self.save_json(OPPORTUNITY_FILE, self.opportunities)

        print(f"\n[ANALYST] Results:")
        print(f"  Total analyzed: {len(results)}")
        print(f"  BUILD: {len([r for r in results if r['recommendation'] == 'BUILD'])}")
        print(f"  WATCH: {len([r for r in results if r['recommendation'] == 'WATCH'])}")
        print(f"  SKIP: {len([r for r in results if r['recommendation'] == 'SKIP'])}")

        return results


if __name__ == "__main__":
    analyst = Analyst()
    analyst.run()
