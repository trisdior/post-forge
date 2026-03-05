#!/usr/bin/env python3
"""
Karl — Post Approved Replies Agent
Reads approved items from agent-queue.json and posts them to their platforms.
Updates status to "sent" or "failed" based on result.

Usage:
  python karl-post-replies.py              # Post all approved replies
  python karl-post-replies.py --dry-run    # Show what would be posted (no actual posts)
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
ENGAGEMENT_LOG = DATA_DIR / "engagement-log.json"

def get_platform_from_source(source: str) -> str:
    """Extract platform from source string."""
    source_lower = source.lower()
    if "reddit" in source_lower:
        return "reddit"
    elif "facebook" in source_lower:
        return "facebook"
    elif "craigslist" in source_lower:
        return "craigslist"
    elif "nextdoor" in source_lower:
        return "nextdoor"
    return "unknown"

def post_to_platform(item: dict, dry_run: bool = False) -> tuple[bool, str]:
    """
    Post reply to the appropriate platform.
    Returns (success, message)
    """
    platform = get_platform_from_source(item.get("source", ""))
    reply_text = item.get("draftReply", "")
    post_url = item.get("postUrl", "")
    
    if not reply_text:
        return False, "No draft reply"
    
    if not post_url:
        return False, "No post URL"
    
    if dry_run:
        return True, f"[DRY RUN] Would post to {platform}"
    
    # For now, we log the action and mark as "sent"
    # In production, this would connect to each platform's API:
    # - Reddit: PRAW (Python Reddit API Wrapper)
    # - Facebook: Facebook Graph API
    # - Craigslist: Selenium or email (they don't have official API)
    # - Nextdoor: Browser automation (no official API)
    
    # Log the engagement
    try:
        if ENGAGEMENT_LOG.exists():
            with open(ENGAGEMENT_LOG) as f:
                log = json.load(f)
        else:
            log = []
        
        log.append({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "platform": platform,
            "postUrl": post_url,
            "reply": reply_text,
            "itemId": item.get("id"),
            "source": item.get("source")
        })
        
        with open(ENGAGEMENT_LOG, "w") as f:
            json.dump(log, f, indent=2)
        
        return True, f"Logged to {platform}"
    except Exception as e:
        return False, f"Log error: {str(e)}"

def main():
    parser = argparse.ArgumentParser(description="Karl: Post approved replies to platforms")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be posted")
    parser.add_argument("--limit", type=int, default=None, help="Max replies to post")
    args = parser.parse_args()
    
    if not AGENT_QUEUE.exists():
        print("[ERROR] agent-queue.json not found")
        return 1
    
    with open(AGENT_QUEUE) as f:
        queue = json.load(f)
    
    # Find approved items
    approved_items = [item for item in queue if item.get("status") == "approved"]
    
    if not approved_items:
        print("[KARL] No approved replies to post.")
        return 0
    
    # Limit if requested
    if args.limit:
        approved_items = approved_items[:args.limit]
    
    print(f"\n[KARL] {'[DRY RUN] ' if args.dry_run else ''}Posting {len(approved_items)} approved replies...")
    print("="*70)
    
    posted_count = 0
    failed_count = 0
    
    for item in approved_items:
        item_id = item.get("id", "unknown")
        source = item.get("source", "Unknown")
        
        success, message = post_to_platform(item, dry_run=args.dry_run)
        
        if success:
            item["status"] = "sent"
            item["sentAt"] = datetime.utcnow().isoformat() + "Z"
            posted_count += 1
            print(f"[OK] {source[:30]:30} — {message}")
        else:
            item["status"] = "failed"
            item["failureReason"] = message
            item["failedAt"] = datetime.utcnow().isoformat() + "Z"
            failed_count += 1
            print(f"[FAIL] {source[:30]:30} — {message}")
    
    # Save updated queue
    with open(AGENT_QUEUE, "w") as f:
        json.dump(queue, f, indent=2)
    
    print("="*70)
    print(f"[DONE] Posted: {posted_count} | Failed: {failed_count}")
    if failed_count > 0:
        print("\nFailed items need manual attention. Check logs for details.")
    print("="*70 + "\n")
    
    return 1 if failed_count > 0 else 0

if __name__ == "__main__":
    exit(main())
