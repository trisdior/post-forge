#!/usr/bin/env python3
"""
Architect Agent — Christopher Valencia Enterprises
Takes BUILD-scored opportunities from Analyst and creates:
- Product spec (what to build)
- Revenue model (how it makes money)
- Tech stack (what tools/frameworks)
- MVP scope (ship in 24-48h)
- Competitive edge (why we win)

Outputs build specs to Builder queue.
"""

import json
import os
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
BUILD_QUEUE_FILE = os.path.join(DATA_DIR, "build-queue.json")
SPECS_FILE = os.path.join(DATA_DIR, "build-specs.json")


class Architect:
    def __init__(self):
        self.build_queue = self.load_json(BUILD_QUEUE_FILE, [])
        self.specs = self.load_json(SPECS_FILE, [])

    def load_json(self, path, default):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return default

    def save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def determine_product_type(self, opp):
        """Determine what kind of product to build"""
        title = opp.get("title", "").lower()
        snippet = opp.get("snippet", "").lower()
        combined = title + " " + snippet

        if any(w in combined for w in ["chrome", "browser", "extension", "plugin"]):
            return "chrome_extension"
        elif any(w in combined for w in ["api", "endpoint", "webhook", "integration"]):
            return "api_service"
        elif any(w in combined for w in ["app", "mobile", "ios", "android", "phone"]):
            return "web_app"
        elif any(w in combined for w in ["bot", "agent", "automate", "automation"]):
            return "agent_skill"
        elif any(w in combined for w in ["dashboard", "analytics", "tracker", "monitor"]):
            return "saas_dashboard"
        elif any(w in combined for w in ["template", "tool", "generator", "builder"]):
            return "tool"
        else:
            return "saas_webapp"

    def determine_revenue_model(self, product_type):
        """Suggest revenue model based on product type"""
        models = {
            "chrome_extension": {"model": "freemium", "price": "$5-15/mo", "target_mrr": "$10K"},
            "api_service": {"model": "usage_based", "price": "$0.01-0.10/call", "target_mrr": "$25K"},
            "web_app": {"model": "subscription", "price": "$10-30/mo", "target_mrr": "$50K"},
            "agent_skill": {"model": "marketplace", "price": "$20-100/skill", "target_mrr": "$15K"},
            "saas_dashboard": {"model": "subscription", "price": "$15-50/mo", "target_mrr": "$30K"},
            "tool": {"model": "one_time_or_sub", "price": "$10-50", "target_mrr": "$10K"},
            "saas_webapp": {"model": "subscription", "price": "$10-30/mo", "target_mrr": "$20K"},
        }
        return models.get(product_type, models["saas_webapp"])

    def determine_tech_stack(self, product_type):
        """Suggest tech stack for fast MVP"""
        stacks = {
            "chrome_extension": "Manifest V3, JavaScript, Chrome APIs",
            "api_service": "FastAPI (Python) or Express (Node), Railway deploy",
            "web_app": "Next.js + Tailwind + Supabase, Vercel deploy",
            "agent_skill": "Python, OpenClaw skill format, ClawHub publish",
            "saas_dashboard": "Next.js + Tailwind + Chart.js + Supabase, Vercel",
            "tool": "Python CLI or Next.js webapp, pip/npm publish",
            "saas_webapp": "Next.js + Tailwind + Supabase + Stripe, Vercel",
        }
        return stacks.get(product_type, stacks["saas_webapp"])

    def create_spec(self, opp):
        """Create a full build spec for an opportunity"""
        product_type = self.determine_product_type(opp)
        revenue = self.determine_revenue_model(product_type)
        tech_stack = self.determine_tech_stack(product_type)

        spec = {
            "id": opp["id"],
            "opportunity_title": opp["title"],
            "opportunity_url": opp["url"],
            "opportunity_score": opp.get("overall_score", 0),

            "product": {
                "type": product_type,
                "name": f"[NEEDS NAME]",
                "tagline": f"[NEEDS TAGLINE]",
                "problem": opp["title"],
                "signals": opp.get("signals", []),
            },

            "revenue": revenue,
            "tech_stack": tech_stack,

            "mvp_scope": {
                "timeline": "24-48 hours",
                "core_features": [
                    "Core pain point solution",
                    "User authentication",
                    "Payment integration (Stripe)",
                    "Landing page with value prop",
                ],
                "post_mvp": [
                    "Analytics dashboard",
                    "Team features",
                    "API access",
                    "Mobile optimization",
                ],
            },

            "competitive_edge": "Ship faster, iterate faster, price aggressively",
            "status": "spec_ready",
            "created_at": datetime.now().isoformat(),
        }

        return spec

    def run(self):
        """Create specs for all BUILD candidates"""
        print(f"[ARCHITECT] Starting at {datetime.now().isoformat()}")

        unspecced = [o for o in self.build_queue if not any(
            s["id"] == o["id"] for s in self.specs
        )]

        print(f"[ARCHITECT] {len(unspecced)} opportunities need specs")

        new_specs = []
        for opp in unspecced:
            spec = self.create_spec(opp)
            new_specs.append(spec)
            print(f"  SPEC: {spec['product']['type']} | {opp['title'][:60]}")
            print(f"        Revenue: {spec['revenue']['model']} @ {spec['revenue']['price']}")
            print(f"        Stack: {spec['tech_stack']}")

        self.specs.extend(new_specs)
        self.save_json(SPECS_FILE, self.specs)

        print(f"\n[ARCHITECT] {len(new_specs)} specs created")
        print(f"[ARCHITECT] Total specs: {len(self.specs)}")

        return new_specs


if __name__ == "__main__":
    architect = Architect()
    architect.run()
