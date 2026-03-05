#!/usr/bin/env python3
"""
CVE Full Pipeline — Christopher Valencia Enterprises
Scout -> Analyst -> Architect -> Builder -> Launcher
"""

import json
import os
from datetime import datetime
from scout import Scout
from analyst import Analyst
from architect import Architect
from builder import Builder
from launcher import Launcher

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def run_pipeline():
    print("=" * 60)
    print("  CHRISTOPHER VALENCIA ENTERPRISES")
    print("  Full Pipeline Run")
    print(f"  {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
    print("=" * 60)
    print()

    # Phase 1: Scout
    print("[PHASE 1] Scouting...")
    scout = Scout()
    opportunities = scout.run()
    print()

    # Phase 2: Analyze
    print("[PHASE 2] Analyzing...")
    analyst = Analyst()
    analyses = analyst.run()
    print()

    # Phase 3: Architect
    print("[PHASE 3] Architecting build specs...")
    architect = Architect()
    specs = architect.run()
    print()

    # Phase 4: Builder
    print("[PHASE 4] Building projects...")
    builder = Builder()
    builds = builder.run()
    print()

    # Phase 5: Launcher
    print("[PHASE 5] Creating launch packages...")
    launcher = Launcher()
    launches = launcher.run()
    print()

    # Summary
    build_queue_file = os.path.join(DATA_DIR, "build-queue.json")
    try:
        with open(build_queue_file, 'r') as f:
            build_queue = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        build_queue = []

    revenue_file = os.path.join(DATA_DIR, "revenue.json")
    try:
        with open(revenue_file, 'r') as f:
            revenue = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        revenue = {"total_mrr": 0, "target_mrr": 1000000}

    print("=" * 60)
    print("  PIPELINE COMPLETE")
    print("=" * 60)
    print(f"  Opportunities found:  {len(opportunities)}")
    print(f"  Analyzed:             {len(analyses)}")
    print(f"  Specs created:        {len(specs)}")
    print(f"  Projects built:       {len(builds)}")
    print(f"  Launch packages:      {len(launches)}")
    print(f"  Current MRR:          ${revenue.get('total_mrr', 0):,.0f}")
    print(f"  Target MRR:           $1,000,000")
    print("=" * 60)

    # Save run log
    run_log = {
        "timestamp": datetime.now().isoformat(),
        "opportunities_found": len(opportunities),
        "analyzed": len(analyses),
        "specs_created": len(specs),
        "projects_built": len(builds),
        "launches_ready": len(launches),
        "current_mrr": revenue.get("total_mrr", 0),
    }

    log_file = os.path.join(DATA_DIR, "pipeline-log.json")
    try:
        with open(log_file, 'r') as f:
            logs = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logs = []

    logs.append(run_log)
    with open(log_file, 'w') as f:
        json.dump(logs, f, indent=2, default=str)

    return run_log


if __name__ == "__main__":
    run_pipeline()
