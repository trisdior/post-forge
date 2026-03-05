#!/usr/bin/env python3
"""
Rebuild queue from source data with STRICT filters for real hiring intent
Only keep posts where someone is explicitly looking for workers/contractors
"""

import json
import re
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

# Load source data
sources_to_process = {
    "nextdoor": DATA_DIR / "nextdoor-leads-latest.json",
    "craigslist": DATA_DIR / "craigslist-latest.json",
    "facebook": DATA_DIR / "facebook-leads-latest.json",
}

# ── STRICT PATTERNS (person explicitly needs contractor/worker) ──
MUST_MATCH = [
    # "Looking for contractor" + project name
    r"(?i)looking\s+for\s+(?:a\s+)?contractor.*(?:deconversion|renovation|remodel|kitchen|bathroom|flooring|painting|roof)",
    # "Need contractor"
    r"(?i)need\s+(?:a\s+)?(?:contractor|builder|general\s+contractor)",
    # Emergency/urgent + problem
    r"(?i)(?:emergency|urgent|asap|help).*(?:repair|fix|leak|damage|broken)",
    # "Water damage/leak/burst" (problems needing immediate contractor)
    r"(?i)(?:water|pipe|sewer|roof)\s+(?:leak|burst|damage|break)",
    # "Deconversion/kitchen/bathroom" + looking/need/seeking
    r"(?i)(?:deconversion|kitchen\s+remodel|bathroom\s+remodel).*(?:looking|need|seeking|contractor)",
]

MUST_NOT_MATCH = [
    # Business entities (filtering out contractor COMPANIES)
    r"(?i)(?:\b(?:llc|inc|corp|co)\b|\&\s*co|chicago|il\s*-\s*nextdoor)",
    # Recommendation requests
    r"(?i)(?:recommend|suggestion|anyone\s+know|who\s+do\s+you)",
    # Questions/advice
    r"(?i)(?:how\s+to|tips|tricks|advice|experience|thoughts)",
]

queue = []
stats = {"nextdoor": 0, "craigslist": 0, "facebook": 0, "kept": 0}

for source_name, file_path in sources_to_process.items():
    if not file_path.exists():
        continue
    
    with open(file_path, encoding='utf-8-sig') as f:
        data = json.load(f)
    
    posts = data if isinstance(data, list) else data.get("posts", [])
    stats[source_name] = len(posts)
    
    for post in posts:
        title = post.get("title", "")
        snippet = post.get("snippet", "")
        url = post.get("url", "")
        
        combined = f"{title} {snippet}".lower()
        
        # Check MUST NOT match first (quick disqualify)
        skip = False
        for pattern in MUST_NOT_MATCH:
            if re.search(pattern, combined):
                skip = True
                break
        
        if skip:
            continue
        
        # Check MUST match at least one
        keep = False
        for pattern in MUST_MATCH:
            if re.search(pattern, combined):
                keep = True
                break
        
        if not keep:
            continue
        
        # This is a valid lead
        import uuid
        queue.append({
            "id": str(uuid.uuid4()),
            "source": source_name.capitalize() if source_name != "nextdoor" else "Nextdoor",
            "leadName": "(from lead hunter)",
            "postUrl": url,
            "score": 50,  # These passed strict filter
            "status": "pending-approval",
            "draftReply": None,
            "assignedTo": "karl",
            "createdAt": "2026-03-03T13:30:00Z",
            "updatedAt": "2026-03-03T13:30:00Z",
        })
        stats["kept"] += 1

# Save
with open(AGENT_QUEUE, "w", encoding='utf-8') as f:
    json.dump(queue, f, indent=2)

print(f"\n[REBUILD] Strict filter applied")
print(f"\nSource stats:")
print(f"  Nextdoor:   {stats['nextdoor']:3} posts → filtered")
print(f"  Craigslist: {stats['craigslist']:3} posts → filtered")
print(f"  Facebook:   {stats['facebook']:3} posts → filtered")
print(f"\n[RESULT] Queue: {stats['kept']} valid leads")
print(f"\n✓ Queue ready for Karl to draft replies\n")
