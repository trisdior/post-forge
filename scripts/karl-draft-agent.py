#!/usr/bin/env python3
"""
Karl — AI Draft Reply Agent
Reads the "new" lead queue and drafts platform-specific responses.
Updates agent-queue.json with drafted replies.

Usage:
  python karl-draft-agent.py              # Draft all new leads
  python karl-draft-agent.py --limit 10   # Draft only first 10
"""

import json
import sys
import io
from pathlib import Path
from datetime import datetime
import argparse
import subprocess

# Fix Unicode output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

# Platform-specific templates
DRAFTS = {
    "facebook": {
        "kitchen": "Hey! We specialize in kitchen remodels here in Chicago — kitchens, bathrooms, full remodels. Licensed & insured. Would love to help with your project! DM us or call {phone}",
        "bathroom": "Professional bathroom remodels in Chicago area. Quality work, fair pricing. We'd be happy to take a look and give you a free estimate!",
        "remodel": "Looking for a trusted contractor in Chicago? We handle kitchens, bathrooms, flooring, drywall, painting — you name it. Licensed & insured. Free estimate!",
        "painting": "Interior/exterior painting in Chicago. Licensed & insured. Give us a call for a free quote!",
        "default": "Hey! Valencia Construction here — we handle remodels, handyman work, and more in the Chicago area. Licensed & insured. Would love to help!"
    },
    "reddit": {
        "kitchen": "We do kitchen remodels in Chicago — licensed, insured, owner-operated. If you're interested in a free estimate, feel free to reach out. Happy to discuss options and pricing.",
        "bathroom": "Chicago contractor here — we specialize in bathroom remodels. Licensed & insured. Happy to provide a free estimate if you're in the area.",
        "remodel": "Licensed contractor in Chicago area here. We handle remodels, flooring, drywall, painting — the whole nine. Feel free to DM if you want a quote.",
        "default": "Valencia Construction here — we're a licensed GC in Chicago. We'd be happy to help and provide a free estimate. DM if interested!"
    },
    "craigslist": {
        "kitchen": "Professional kitchen remodeling — licensed & insured. Free in-home estimates. Call or text for details.",
        "bathroom": "Bathroom remodeling specialist. Quality work, fair prices. Free estimate available.",
        "remodel": "Licensed general contractor. Kitchens, bathrooms, flooring, drywall, painting. Free estimates. (773) 682-7788",
        "default": "Valencia Construction — licensed & insured. Call for free estimate. (773) 682-7788"
    },
    "nextdoor": {
        "kitchen": "Kitchen remodel specialist here in the neighborhood! Licensed & insured. Free estimates. Let's talk about your project!",
        "bathroom": "Professional bathroom remodels. Quality, licensed contractor. Would love to help!",
        "default": "Hi neighbor! Valencia Construction — we do remodels, handyman work, and more. Licensed & insured. Would love to help!"
    },
    "reddit-pm": {
        "default": "Interesting opportunity. Licensed contractor in Chicago area. Happy to discuss details. When are you looking to start?"
    }
}

def is_valid_lead(item):
    """Check if lead looks legitimate (not contractor spam or recommendation requests)."""
    source = item.get("source", "").lower()
    post_url = item.get("postUrl", "").lower()
    combined = f"{source} {post_url}"
    
    red_flags = [
        "llc", "inc", "corp", 
        "free estimate", "licensed insured", "years of experience",
        "recommend", "recommendation", "who do you",
        "any good", "anyone know", "suggestions",
    ]
    
    for flag in red_flags:
        if flag in combined:
            return False
    return True

def get_draft(source, category):
    """Generate a draft reply based on platform and category."""
    source_key = source.split(" - ")[0].lower() if " - " in source else source.lower()
    
    # Normalize source key
    if "facebook" in source_key:
        source_key = "facebook"
    elif "reddit" in source_key:
        source_key = "reddit"
    elif "craigslist" in source_key:
        source_key = "craigslist"
    elif "nextdoor" in source_key:
        source_key = "nextdoor"
    
    # Get category-specific draft or use default
    if source_key in DRAFTS:
        templates = DRAFTS[source_key]
        category_lower = category.lower() if category else ""
        
        # Try exact match first
        if category_lower in templates:
            return templates[category_lower]
        
        # Try partial match
        for key in templates.keys():
            if key in category_lower or category_lower in key:
                return templates[key]
        
        # Default for this source
        return templates.get("default", DRAFTS[source_key].get("default", "Hi! Valencia Construction — licensed contractor. Would love to help!"))
    
    # Global default
    return "Hi there! Valencia Construction here — licensed & insured general contractor. Would love to discuss your project. Feel free to reach out!"

def main():
    parser = argparse.ArgumentParser(description="Karl: Draft replies for queued leads")
    parser.add_argument("--limit", type=int, default=None, help="Max leads to draft")
    args = parser.parse_args()
    
    if not AGENT_QUEUE.exists():
        print("ERROR: agent-queue.json not found")
        return 1
    
    with open(AGENT_QUEUE) as f:
        queue = json.load(f)
    
    # Find leads without drafts (pending-approval with null draftReply) and pass validation
    leads_needing_drafts = [item for item in queue if (item.get("status") == "pending-approval" or item.get("status") == "new") and not item.get("draftReply") and is_valid_lead(item)]
    
    if not leads_needing_drafts:
        print("[KARL] All leads already have drafts or are filtered as invalid.")
        return 0
    
    # Limit if requested
    if args.limit:
        new_leads = new_leads[:args.limit]
    
    print(f"\n[KARL] Drafting replies for {len(leads_needing_drafts)} leads...")
    print("="*70)
    
    drafted_count = 0
    
    for item in leads_needing_drafts:
        source = item.get("source", "Unknown")
        category = item.get("category", "")
        item_id = item.get("id", "unknown")
        
        # Generate draft
        draft = get_draft(source, category)
        item["draftReply"] = draft
        item["status"] = "pending-approval"  # Mark as ready for approval
        item["draftedAt"] = datetime.utcnow().isoformat() + "Z"
        
        drafted_count += 1
        print(f"\n✓ {drafted_count}. {source} — {category or 'General'}")
        print(f"   Lead: {item.get('leadName', '(unnamed)')}")
        print(f"   Draft: {draft[:70]}...")
    
    # Save updated queue
    with open(AGENT_QUEUE, "w") as f:
        json.dump(queue, f, indent=2)
    
    print("\n" + "="*70)
    print(f"✓ Drafted {drafted_count} replies")
    print(f"  Next: Karl will send these to Tris for approval via Telegram")
    print("="*70 + "\n")
    
    return 0

if __name__ == "__main__":
    exit(main())
