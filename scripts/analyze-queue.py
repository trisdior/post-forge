#!/usr/bin/env python3
import json
from pathlib import Path

DATA_DIR = Path(r"C:\Users\trisd\clawd\data")
AGENT_QUEUE = DATA_DIR / "agent-queue.json"

with open(AGENT_QUEUE) as f:
    queue = json.load(f)

# Show samples
print("Sample leads from queue:\n")
for i, item in enumerate(queue[:10]):
    print(f"{i+1}. Source: {item.get('source')}")
    print(f"   PostUrl: {item.get('postUrl')[:100]}...")
    print()
