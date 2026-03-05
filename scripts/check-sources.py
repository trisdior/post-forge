#!/usr/bin/env python3
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")

sources = {
    "craigslist": DATA_DIR / "craigslist-latest.json",
    "nextdoor": DATA_DIR / "nextdoor-leads-latest.json",
    "facebook": DATA_DIR / "facebook-leads-latest.json",
}

for name, file_path in sources.items():
    if file_path.exists():
        with open(file_path, encoding='utf-8-sig') as f:
            data = json.load(f)
        
        if isinstance(data, list):
            posts = data
        else:
            posts = data.get("posts", [])
        
        print(f"{name.upper():15} {len(posts):3} posts")
        if posts:
            title = posts[0].get("title", posts[0].get("snippet", "?"))[:70]
            print(f"  Sample: {title}")
        print()
