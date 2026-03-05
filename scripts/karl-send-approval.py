#!/usr/bin/env python3
"""
Karl → Telegram Approval Request Sender
Formats draft replies from agent-queue.json and sends to Tris via Telegram for approval.

Usage:
  python karl-send-approval.py              # Send all pending drafts
  python karl-send-approval.py --batch 5    # Send in batches of 5
"""

import json
import os
from pathlib import Path
from datetime import datetime
import argparse
import subprocess

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

def format_approval_request(leads, batch_num=1, total_batches=1):
    """Format leads into a Telegram approval message."""
    
    # Sort by score (Hot first)
    leads_sorted = sorted(leads, key=lambda x: x.get("score", 0), reverse=True)
    
    # Count by priority
    hot = [l for l in leads_sorted if l.get("score", 0) >= 50]
    warm = [l for l in leads_sorted if 25 <= l.get("score", 0) < 50]
    cold = [l for l in leads_sorted if l.get("score", 0) < 25]
    
    lines = []
    lines.append(f"🤝 KARL — APPROVAL REQUESTS [{batch_num}/{total_batches}]")
    lines.append(f"Total: {len(leads_sorted)} leads | Hot: {len(hot)} | Warm: {len(warm)} | Cold: {len(cold)}")
    lines.append("")
    
    for i, lead in enumerate(leads_sorted, 1):
        source = lead.get("source", "Unknown")
        score = lead.get("score", 0)
        url = lead.get("postUrl", "")
        lead_name = lead.get("leadName", "(unnamed)")
        
        # Priority emoji
        if score >= 50:
            priority = "[HOT]"
        elif score >= 25:
            priority = "[WARM]"
        else:
            priority = "[COLD]"
        
        lines.append(f"{i}. {priority} {source} (score: {score})")
        lines.append(f"   Lead: {lead_name}")
        lines.append(f"   URL: {url}")
        if lead.get("draftReply"):
            lines.append(f"   Draft: {lead['draftReply'][:100]}...")
        lines.append("")
    
    lines.append("Action: reply with: approve all / approve 1,2,4 / reject 3 / skip")
    lines.append(f"Batch ID: karl-approval-{datetime.now().isoformat()}")
    
    return "\n".join(lines)

def send_to_telegram(message):
    """Send formatted message to Tris via Telegram."""
    # Use the message tool via subprocess
    # The Telegram chat ID is stored in MEMORY.md: 942294138
    
    cmd = [
        "openclaw",
        "message",
        "send",
        "--to", "942294138",
        "--message", message,
        "--channel", "telegram"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return True, "Sent to Telegram"
        else:
            return False, f"Telegram error: {result.stderr}"
    except Exception as e:
        return False, f"Failed to send: {str(e)}"

def main():
    parser = argparse.ArgumentParser(description="Send Karl's draft approvals to Tris via Telegram")
    parser.add_argument("--batch", type=int, default=10, help="Max leads per Telegram message")
    args = parser.parse_args()
    
    if not AGENT_QUEUE.exists():
        print("ERROR: agent-queue.json not found")
        return 1
    
    with open(AGENT_QUEUE) as f:
        queue = json.load(f)
    
    # Find all leads with draft replies ready
    pending = [item for item in queue if item.get("status") == "pending-approval"]
    
    if not pending:
        print("No drafts pending approval")
        return 0
    
    print(f"\n[KARL] Sending {len(pending)} draft approvals to Tris via Telegram...")
    print("="*70)
    
    # Send in batches
    batches = [pending[i:i+args.batch] for i in range(0, len(pending), args.batch)]
    total_batches = len(batches)
    
    for batch_num, batch in enumerate(batches, 1):
        message = format_approval_request(batch, batch_num, total_batches)
        
        print(f"\nBatch {batch_num}/{total_batches}: {len(batch)} leads")
        print("-"*70)
        print(message)
        print()
        
        # Send to Telegram
        success, msg = send_to_telegram(message)
        
        if success:
            print(f"✓ Sent batch {batch_num} to Telegram")
            
            # Update queue status
            for item in batch:
                item["status"] = "awaiting-approval"
                item["approvalSentAt"] = datetime.utcnow().isoformat() + "Z"
            
            with open(AGENT_QUEUE, "w") as f:
                json.dump(queue, f, indent=2)
        else:
            print(f"✗ Failed: {msg}")
            return 1
    
    print("\n" + "="*70)
    print(f"✓ All {len(pending)} drafts sent to Tris for approval")
    print("="*70 + "\n")
    return 0

if __name__ == "__main__":
    exit(main())
