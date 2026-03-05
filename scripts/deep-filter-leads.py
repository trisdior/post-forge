#!/usr/bin/env python3
"""
Deep filter: Analyze each lead individually and keep only:
- People explicitly saying they NEED work done (not asking questions)
- Posts looking for contractors/workers (not recommendations)
- Actual problems needing solutions (not advice seeking)
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

# KEEP: Clear hiring intent patterns
KEEP_PATTERNS = [
    # "I need/I want to hire/I'm looking to hire"
    (r"(?i)i\s+need\s+(?:a\s+)?(?:contractor|plumber|painter|electrician|worker|person|someone)\s+", 20),
    (r"(?i)i.*need.*(?:kitchen|bathroom|remodel|renovation|flooring|tile|drywall|painting|electrical|plumbing)", 20),
    (r"(?i)looking\s+(?:to\s+)?(?:hire|get|find).*(?:contractor|plumber|painter)", 20),
    
    # Direct problem: "My X is broken/damaged/leaking"
    (r"(?i)my\s+\w{1,20}\s+(?:broke|burst|leak|crack|rot|flood|damage)", 25),
    (r"(?i)(?:water|sewer|pipe)\s+(?:burst|broke|leak|damage)", 25),
    (r"(?i)(?:mold|mildew|rot|termite)\s+(?:in|on)\s+my", 25),
    
    # "Getting estimates/bids"
    (r"(?i)(?:getting|getting\s+)?(?:bids|quotes|estimates)\s+(?:for|from)", 20),
    (r"(?i)looking\s+(?:for\s+)?quotes", 15),
    
    # "Contractor/builder/construction worker"
    (r"(?i)(?:general\s+)?contractor", 15),
    (r"(?i)(?:need to\s+)?(?:hire|find)\s+a\s+(?:general\s+)?contractor", 20),
    
    # Urgent/emergency
    (r"(?i)(?:urgent|emergency|asap|help)", 20),
    
    # Specific project scope
    (r"(?i)(?:kitchen|bathroom)\s+(?:remodel|renovation|upgrade|redo)", 15),
    (r"(?i)(?:new|install|replace)\s+(?:flooring|tile|drywall|cabinets|counters)", 15),
]

# SKIP: Patterns indicating this is NOT a hiring post
SKIP_PATTERNS = [
    # Asking for advice/information (not hiring)
    (r"(?i)how\s+(?:do|to|can|should|much)", "asking_for_advice"),
    (r"(?i)(?:what|which|where|when|why)\s+(?:is|are|should)", "asking_for_advice"),
    (r"(?i)tips|tricks|advice|help.*(?:understand|figure|learn)", "asking_for_advice"),
    
    # Asking for recommendations
    (r"(?i)(?:recommend|suggestion|who\s+do\s+you|anyone\s+know)", "recommendation"),
    
    # General discussion/opinion
    (r"(?i)(?:thoughts?|opinions?|experience|thoughts)\s+(?:on|about|with)", "discussion"),
    (r"(?i)(?:does|is|should)\s+.*\?$", "question"),
    
    # Learning/DIY intent
    (r"(?i)(?:diy|do\s+it\s+yourself|thinking\s+of\s+doing|can\s+i)", "diy_planning"),
    (r"(?i)(?:consider|think|wonder|curious)", "contemplation"),
    
    # Comparison/research
    (r"(?i)(?:vs|versus|compare|better|worse)", "comparison"),
    (r"(?i)(?:price|cost|expensive|cheap)", "pricing_discussion"),
    
    # Theoretical/hypothetical
    (r"(?i)(?:if\s+|would\s+you|what\s+if)", "hypothetical"),
]

kept = []
removed = []

for item in queue:
    source = item.get("source", "")
    url = item.get("postUrl", "").lower()
    
    # Extract Reddit slug for better title matching
    slug = ""
    if "reddit" in url.lower():
        slug_match = re.search(r'/comments/[^/]+/([^/]+)/?$', url)
        if slug_match:
            slug = slug_match.group(1).replace("_", " ")
    
    combined = f"{source} {slug} {url}".lower()
    
    # Check SKIP patterns first
    skip_reason = None
    for pattern, reason in SKIP_PATTERNS:
        if re.search(pattern, combined):
            skip_reason = reason
            break
    
    # Check KEEP patterns
    keep_score = 0
    for pattern, score in KEEP_PATTERNS:
        if re.search(pattern, combined):
            keep_score += score
    
    # Decision logic:
    # - If it matches a KEEP pattern AND doesn't match a SKIP pattern → KEEP
    # - If it matches SKIP pattern AND doesn't have strong KEEP signal → SKIP
    if skip_reason and keep_score < 20:
        removed.append({
            "id": item["id"],
            "slug": slug[:70],
            "reason": skip_reason,
            "score": keep_score
        })
    elif keep_score >= 15:
        kept.append(item)
    else:
        removed.append({
            "id": item["id"],
            "slug": slug[:70],
            "reason": "low_signal",
            "score": keep_score
        })

# Save cleaned queue
with open(AGENT_QUEUE, "w", encoding='utf-8') as f:
    json.dump(kept, f, indent=2)

print(f"\n[DEEP FILTER] Analyzed {len(queue)} leads")
print(f"[KEPT] {len(kept)} actual hiring leads")
print(f"[REMOVED] {len(removed)} non-hiring posts")
print(f"\nQueue size: {len(queue)} → {len(kept)} ({int(100*len(kept)/len(queue))}%)")

# Show what was removed
reason_counts = {}
for item in removed:
    reason = item["reason"]
    reason_counts[reason] = reason_counts.get(reason, 0) + 1

print(f"\nRemoved breakdown:")
for reason, count in sorted(reason_counts.items(), key=lambda x: -x[1]):
    print(f"  {reason:20} {count:3} posts")

print(f"\nSample removed posts:")
for item in removed[:10]:
    print(f"  - {item['slug'][:60]:60} ({item['reason']})")

print("\n✓ Deep filtered queue saved\n")
