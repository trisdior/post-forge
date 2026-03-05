#!/usr/bin/env python3
"""
Manual cleanup: Remove recommendation requests from agent-queue.json
Identifies posts where someone is ASKING for recommendations vs. posting their own need.
"""

import json
import re
import sys
import io
from pathlib import Path

# Fix Unicode output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

with open(AGENT_QUEUE) as f:
    queue = json.load(f)

# Patterns that indicate "asking for recommendation" not "I need work done"
RECOMMENDATION_PATTERNS = [
    r"(?i)anyone\s+know\s+a",
    r"(?i)anyone\s+have\s+a.*recommend",
    r"(?i)can\s+someone\s+recommend",
    r"(?i)recommendations?\s+for",
    r"(?i)who\s+do\s+you\s+(?:use|recommend|know)",
    r"(?i)suggestions?\s+for\s+a",
    r"(?i)best\s+contractor",
    r"(?i)trusted\s+(?:contractor|plumber|electrician)",
    r"(?i)referrals?\s+for",
    r"(?i)looking\s+for\s+recommendations?",
    r"(?i)does\s+anyone\s+have\s+(?:a|any).*(?:contractor|plumber|painter)",
]

removed_count = 0
kept_count = 0
removed_items = []
queue_filtered = []

for item in queue:
    source = item.get("source", "")
    post_url = item.get("postUrl", "")
    
    # Check if this is a recommendation request
    is_recommendation = False
    for pattern in RECOMMENDATION_PATTERNS:
        if re.search(pattern, f"{source} {post_url}"):
            is_recommendation = True
            break
    
    if is_recommendation:
        removed_items.append({
            "id": item.get("id"),
            "source": source,
            "url": post_url[:80]
        })
        removed_count += 1
    else:
        queue_filtered.append(item)
        kept_count += 1

# Save cleaned queue
with open(AGENT_QUEUE, "w") as f:
    json.dump(queue_filtered, f, indent=2)

print(f"\n[CLEANUP] Removed {removed_count} recommendation requests")
print(f"[CLEANUP] Kept {len(queue_filtered)} valid direct leads")
print(f"[CLEANUP] Queue size: {len(queue)} → {len(queue_filtered)}")

if removed_items:
    print(f"\nRemoved posts:")
    for item in removed_items[:10]:
        print(f"  - {item['source'][:40]:40} | {item['url']}")
    if len(removed_items) > 10:
        print(f"  ... and {len(removed_items) - 10} more")

print("\n✓ Done\n")
