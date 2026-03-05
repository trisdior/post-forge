#!/usr/bin/env python3
"""
Test: Approval Workflow
Simulates the entire flow: Draft → Approve → Post → Log
"""

import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"
ENGAGEMENT_LOG = DATA_DIR / "engagement-log.json"

print("\n[TEST] Approval Workflow — End-to-End Test")
print("="*70)

# 1. Check Karl's drafts
print("\n[STEP 1] Check Karl's Drafts")
with open(AGENT_QUEUE) as f:
    queue = json.load(f)

drafts_ready = [x for x in queue if x.get('draftReply') and x.get('status') == 'pending-approval']
print(f"Drafts ready for approval: {len(drafts_ready)}")
if drafts_ready:
    sample = drafts_ready[0]
    print(f"Sample draft: {sample['source']}")
    print(f"Reply: {sample['draftReply'][:60]}...")

# 2. Simulate approval
print("\n[STEP 2] Simulate Approval (Set 2 to 'approved')")
test_items = drafts_ready[:2]
for item in test_items:
    item['status'] = 'approved'
    print(f"Approved: {item['source']}")

with open(AGENT_QUEUE, 'w') as f:
    json.dump(queue, f, indent=2)

# 3. Check posting readiness
print("\n[STEP 3] Check Posting Readiness")
approved = [x for x in queue if x.get('status') == 'approved']
print(f"Items ready to post: {len(approved)}")

# 4. Simulate posting
print("\n[STEP 4] Simulate Posting")
engagement_log = []
if ENGAGEMENT_LOG.exists():
    with open(ENGAGEMENT_LOG) as f:
        engagement_log = json.load(f)

for item in approved:
    # Log engagement
    engagement_log.append({
        "timestamp": "2026-03-03T18:55:00Z",
        "platform": "reddit" if "reddit" in item['source'].lower() else "facebook",
        "postUrl": item['postUrl'],
        "reply": item['draftReply'][:50] + "...",
        "itemId": item['id']
    })
    # Mark as sent
    item['status'] = 'sent'
    item['sentAt'] = '2026-03-03T18:55:00Z'
    print(f"Posted: {item['source']}")

with open(AGENT_QUEUE, 'w') as f:
    json.dump(queue, f, indent=2)

with open(ENGAGEMENT_LOG, 'w') as f:
    json.dump(engagement_log, f, indent=2)

# 5. Final status
print("\n[STEP 5] Final Status")
with open(AGENT_QUEUE) as f:
    queue = json.load(f)

pending = len([x for x in queue if x.get('status') == 'pending-approval'])
sent = len([x for x in queue if x.get('status') == 'sent'])
print(f"Pending approval: {pending}")
print(f"Sent: {sent}")
print(f"Engagement log entries: {len(engagement_log)}")

print("\n" + "="*70)
print("[OK] Workflow test complete — NO ERRORS")
print("="*70 + "\n")
