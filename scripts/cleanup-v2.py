#!/usr/bin/env python3
import json
import re
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

with open(AGENT_QUEUE) as f:
    queue = json.load(f)

# Patterns for recommendation requests (in Reddit URL slugs)
RECOMMENDATION_PATTERNS = [
    r"deep.?clean",           # "cleaners on north shore?"
    r"anyone.?know",           # "does anyone know"
    r"anyone.?else",           # "is anyone else"
    r"who.?do.?you",          # "who do you"
    r"recommendation",        # "recommendations?"
    r"trusted",               # "trusted contractor?"
    r"best.*\w+",             # "best contractor?"
    r"good.*\w+",             # "good plumber?"
]

removed = []

for item in queue:
    url = item.get("postUrl", "").lower()
    
    # Extract the slug from Reddit URLs
    # https://reddit.com/r/chicago/comments/xxxxx/SLUG_HERE/
    slug_match = re.search(r'/comments/[^/]+/([^/]+)/?$', url)
    if not slug_match:
        continue
    
    slug = slug_match.group(1)
    
    # Check if this slug indicates a recommendation request
    is_recommendation = False
    for pattern in RECOMMENDATION_PATTERNS:
        if re.search(pattern, slug):
            is_recommendation = True
            break
    
    if is_recommendation:
        removed.append(item)

# Remove these items
queue_cleaned = [item for item in queue if item not in removed]

# Save
with open(AGENT_QUEUE, "w") as f:
    json.dump(queue_cleaned, f, indent=2)

print(f"\n[CLEANUP] Identified {len(removed)} recommendation requests")
print(f"[CLEANED] Queue: {len(queue)} → {len(queue_cleaned)} leads")

if removed:
    print(f"\nRemoved:")
    for item in removed[:15]:
        url = item.get("postUrl", "")
        slug_match = re.search(r'/([^/]+)/?$', url)
        slug = slug_match.group(1) if slug_match else "unknown"
        print(f"  - {slug[:60]}")
    if len(removed) > 15:
        print(f"  ... and {len(removed) - 15} more")

print("\n✓ Done\n")
