#!/usr/bin/env python3
"""
Source-specific filtering:
- REDDIT: Strict (only clear hiring intent)
- CRAIGSLIST/NEXTDOOR: Moderate (keep more, they self-select better)
"""

import json
import re
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

with open(AGENT_QUEUE, encoding='utf-8') as f:
    queue = json.load(f)

# ── STRICT REDDIT FILTER ─────────────────────────────────────
REDDIT_KEEP = [
    r"(?i)water\s+(?:leak|damage|burst|flood)",
    r"(?i)(?:pipe|sewer|roof)\s+(?:burst|leak|damage)",
    r"(?i)my\s+\w{1,20}\s+(?:broke|burst|leak|crack)",
    r"(?i)(?:emergency|urgent|asap)",
    r"(?i)sump\s+pump",
]

REDDIT_SKIP = [
    r"(?i)(?:how|what|which|why|when|where|can\s+i|should\s+i)",
    r"(?i)(?:tips|tricks|advice|thoughts|opinions)",
    r"(?i)(?:diy|do\s+it\s+yourself|thinking\s+of\s+doing)",
    r"(?i)(?:compare|vs|versus)",
    r"(?i)(?:recommend|suggestion|who\s+do\s+you)",
]

# ── MODERATE CRAIGSLIST/NEXTDOOR FILTER ──────────────────────
# More inclusive since these platforms self-select better
KEEP_GENERAL = [
    r"(?i)contractor",
    r"(?i)(?:hire|need|looking\s+for)",
    r"(?i)(?:remodel|renovation|kitchen|bathroom)",
    r"(?i)(?:repair|fix|install)",
]

SKIP_GENERAL = [
    r"(?i)(?:llc|inc|corp|\&\s*co)",
    r"(?i)(?:free estimate|years of experience)",
    r"(?i)(?:hiring|job|now hiring)",
    r"(?i)(?:recommend|who\s+do\s+you|anyone\s+know)",
]

def filter_reddit(item):
    """Strict: only clear hiring intent."""
    url = item.get("postUrl", "").lower()
    slug = ""
    slug_match = re.search(r'/comments/[^/]+/([^/]+)/?$', url)
    if slug_match:
        slug = slug_match.group(1).replace("_", " ")
    
    combined = f"{slug} {url}"
    
    # Must match at least one KEEP pattern
    has_keep = any(re.search(p, combined) for p in REDDIT_KEEP)
    
    # Must NOT match any SKIP patterns
    has_skip = any(re.search(p, combined) for p in REDDIT_SKIP)
    
    return has_keep and not has_skip

def filter_craigslist_nextdoor(item):
    """Moderate: keep unless obvious spam."""
    url = item.get("postUrl", "").lower()
    combined = url
    
    # Don't keep if it's obvious spam
    has_skip = any(re.search(p, combined) for p in SKIP_GENERAL)
    
    # Do keep if it matches any GENERAL pattern
    has_keep = any(re.search(p, combined) for p in KEEP_GENERAL)
    
    return has_keep and not has_skip

kept = []
removed = []

for item in queue:
    source = item.get("source", "").lower()
    
    if "reddit" in source:
        should_keep = filter_reddit(item)
    elif "craigslist" in source or "nextdoor" in source:
        should_keep = filter_craigslist_nextdoor(item)
    else:
        should_keep = True  # Default: keep
    
    if should_keep:
        kept.append(item)
    else:
        removed.append(item)

# Save filtered queue
with open(AGENT_QUEUE, "w", encoding='utf-8') as f:
    json.dump(kept, f, indent=2)

# Statistics
reddit_before = sum(1 for x in queue if "reddit" in x.get("source", "").lower())
reddit_after = sum(1 for x in kept if "reddit" in x.get("source", "").lower())
cl_before = sum(1 for x in queue if "craigslist" in x.get("source", "").lower())
cl_after = sum(1 for x in kept if "craigslist" in x.get("source", "").lower())
nd_before = sum(1 for x in queue if "nextdoor" in x.get("source", "").lower())
nd_after = sum(1 for x in kept if "nextdoor" in x.get("source", "").lower())

print(f"\n[FILTERED] Queue: {len(queue)} → {len(kept)} leads")
print(f"\nBy source:")
print(f"  Reddit:     {reddit_before:3} → {reddit_after:3} ({int(100*reddit_after/(reddit_before or 1))}%)")
print(f"  Craigslist: {cl_before:3} → {cl_after:3} ({int(100*cl_after/(cl_before or 1))}%)")
print(f"  Nextdoor:   {nd_before:3} → {nd_after:3} ({int(100*nd_after/(nd_before or 1))}%)")

print(f"\nStrategy: Strict for Reddit, Moderate for CL/Nextdoor")
print(f"✓ Queue ready for approval\n")
