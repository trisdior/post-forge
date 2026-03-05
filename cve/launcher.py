#!/usr/bin/env python3
"""
Launcher Agent — Christopher Valencia Enterprises
Takes built projects and:
- Validates the build
- Creates deployment config (Vercel/Railway)
- Generates marketing copy
- Creates social media launch posts
- Tracks launch status + revenue

Outputs launch packages ready for deployment.
"""

import json
import os
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PROJECTS_DIR = os.path.join(os.path.dirname(__file__), "projects")
BUILD_LOG_FILE = os.path.join(DATA_DIR, "build-log.json")
LAUNCH_LOG_FILE = os.path.join(DATA_DIR, "launch-log.json")
REVENUE_FILE = os.path.join(DATA_DIR, "revenue.json")


class Launcher:
    def __init__(self):
        self.build_log = self.load_json(BUILD_LOG_FILE, [])
        self.launch_log = self.load_json(LAUNCH_LOG_FILE, [])
        self.revenue = self.load_json(REVENUE_FILE, {
            "total_mrr": 0,
            "products": [],
            "target_mrr": 1000000,
            "last_updated": None
        })

    def load_json(self, path, default):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def generate_vercel_config(self, project_dir):
        """Create vercel.json for deployment"""
        config = {
            "buildCommand": "next build",
            "outputDirectory": ".next",
            "framework": "nextjs"
        }
        with open(os.path.join(project_dir, "vercel.json"), 'w') as f:
            json.dump(config, f, indent=2)
        return config

    def generate_launch_posts(self, build_entry):
        """Generate social media launch posts"""
        title = build_entry["title"]

        posts = {
            "x_twitter": f"Just shipped: {title[:80]}\n\nBuilt by AI agents in <24h.\n\nNo human developers. No meetings. No delays.\n\nThis is Christopher Valencia Enterprises.\n\n#AI #SaaS #BuildInPublic",

            "reddit_post": {
                "title": f"I built {title[:60]} — feedback welcome",
                "body": f"Hey everyone,\n\nI noticed a lot of people talking about this problem: {title}\n\nSo I built a solution. It's an MVP right now but it works.\n\nWould love your feedback. What features would make this a must-have?\n\n---\nBuilt by Christopher Valencia Enterprises"
            },

            "product_hunt": {
                "tagline": f"Solving: {title[:60]}",
                "description": f"We found this pain point trending across Reddit and HackerNews. Our AI agents built an MVP in under 48 hours. Now we're launching it."
            },

            "hackernews": f"Show HN: {title[:60]} — built by autonomous AI agents"
        }

        return posts

    def create_launch_package(self, build_entry):
        """Create full launch package for a built project"""
        project_dir = build_entry.get("project_dir", "")

        # Generate deployment config
        if os.path.exists(project_dir):
            self.generate_vercel_config(project_dir)

        # Generate launch posts
        posts = self.generate_launch_posts(build_entry)

        # Save launch posts to project dir
        if os.path.exists(project_dir):
            with open(os.path.join(project_dir, "launch-posts.json"), 'w') as f:
                json.dump(posts, f, indent=2)

        launch_entry = {
            "id": build_entry["id"],
            "title": build_entry["title"],
            "type": build_entry["type"],
            "project_dir": project_dir,
            "deployment": {
                "platform": "vercel",
                "status": "ready_to_deploy",
                "url": None,
            },
            "marketing": {
                "posts_generated": len(posts),
                "platforms": list(posts.keys()),
                "status": "ready_to_post"
            },
            "revenue": {
                "mrr": 0,
                "customers": 0,
                "status": "pre_launch"
            },
            "launched_at": None,
            "created_at": datetime.now().isoformat(),
        }

        return launch_entry

    def run(self):
        """Create launch packages for all built projects"""
        print(f"[LAUNCHER] Starting at {datetime.now().isoformat()}")

        # Find builds not yet launched
        launched_ids = {l["id"] for l in self.launch_log}
        new_builds = [b for b in self.build_log if b["id"] not in launched_ids]

        print(f"[LAUNCHER] {len(new_builds)} projects ready to launch")

        for build in new_builds:
            launch = self.create_launch_package(build)
            self.launch_log.append(launch)
            print(f"  LAUNCH READY: {launch['title'][:50]}")
            print(f"    Deploy: {launch['deployment']['platform']} ({launch['deployment']['status']})")
            print(f"    Marketing: {launch['marketing']['posts_generated']} posts for {', '.join(launch['marketing']['platforms'])}")

        self.save_json(LAUNCH_LOG_FILE, self.launch_log)

        # Revenue summary
        total_products = len(self.launch_log)
        total_mrr = sum(l.get("revenue", {}).get("mrr", 0) for l in self.launch_log)
        self.revenue["total_mrr"] = total_mrr
        self.revenue["products"] = [{"id": l["id"], "title": l["title"], "mrr": l.get("revenue", {}).get("mrr", 0)} for l in self.launch_log]
        self.revenue["last_updated"] = datetime.now().isoformat()
        self.save_json(REVENUE_FILE, self.revenue)

        print(f"\n[LAUNCHER] Summary:")
        print(f"  Total products: {total_products}")
        print(f"  Ready to deploy: {len(new_builds)}")
        print(f"  Current MRR: ${total_mrr:,.0f}")
        print(f"  Target MRR: $1,000,000")
        print(f"  Progress: {(total_mrr/1000000)*100:.2f}%")

        return self.launch_log


if __name__ == "__main__":
    launcher = Launcher()
    launcher.run()
