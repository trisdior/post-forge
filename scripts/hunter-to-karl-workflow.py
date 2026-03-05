#!/usr/bin/env python3
"""
Hunter → Integration → Karl Workflow
Executes the full lead generation pipeline:
1. Hunter finds fresh leads (Craigslist, Reddit, Facebook, Nextdoor)
2. Integration script scores & deduplicates them
3. Karl drafts replies and sends approval request to Tris via Telegram

Usage:
  python hunter-to-karl-workflow.py              # Full pipeline
  python hunter-to-karl-workflow.py --dry-run    # Score only, no writes
"""

import subprocess
import sys
import json
import os
from pathlib import Path
from datetime import datetime

# Paths
SCRIPTS_DIR = Path(r"C:\Users\trisd\clawd\scripts")
DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

# Scripts
HUNTER_SCRIPT = SCRIPTS_DIR / "working-lead-hunter.py"
INTEGRATE_SCRIPT = SCRIPTS_DIR / "integrate-scanner-leads.py"

def run_hunter():
    """Step 1: Run Hunter to find fresh leads."""
    print("\n" + "="*70)
    print("STEP 1: HUNTER — Finding fresh leads on Craigslist")
    print("="*70)
    
    result = subprocess.run(
        ["python", str(HUNTER_SCRIPT)],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    
    return result.returncode == 0

def run_integration(dry_run=False):
    """Step 2: Integrate scanner outputs and queue for Karl."""
    print("\n" + "="*70)
    print("STEP 2: INTEGRATION — Scoring & queuing leads for Karl")
    print("="*70)
    
    cmd = ["python", str(INTEGRATE_SCRIPT)]
    if dry_run:
        cmd.append("--dry-run")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    
    return result.returncode == 0

def count_queued():
    """Check how many leads are queued for Karl."""
    if not AGENT_QUEUE.exists():
        return 0
    
    with open(AGENT_QUEUE) as f:
        queue = json.load(f)
    
    return len([item for item in queue if item.get("status") == "new"])

def notify_karl():
    """Step 3: Notify Karl to draft replies."""
    print("\n" + "="*70)
    print("STEP 3: KARL — Drafting replies from queued leads")
    print("="*70)
    
    queued = count_queued()
    
    if queued == 0:
        print("✓ No new leads to process.")
        return True
    
    print(f"✓ {queued} new lead(s) queued for Karl")
    print(f"  Karl will draft replies and send approval to Tris via Telegram")
    
    # In a real setup, this would spawn the Karl agent or trigger a cron job
    # For now, just log the status
    return True

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Hunter → Integration → Karl workflow")
    parser.add_argument("--dry-run", action="store_true", help="Score only")
    args = parser.parse_args()
    
    print(f"\n🔄 HUNTER → INTEGRATION → KARL WORKFLOW")
    print(f"   Time: {datetime.now().strftime('%I:%M %p %Z')}")
    
    # Step 1: Hunter finds leads
    if not run_hunter():
        print("❌ Hunter failed")
        sys.exit(1)
    
    # Step 2: Integrate and queue
    if not run_integration(dry_run=args.dry_run):
        print("❌ Integration failed")
        sys.exit(1)
    
    # Step 3: Notify Karl
    if not notify_karl():
        print("❌ Karl notification failed")
        sys.exit(1)
    
    print("\n" + "="*70)
    print("✅ WORKFLOW COMPLETE")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
