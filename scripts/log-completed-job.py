#!/usr/bin/env python3
"""
Log a completed job for Valencia Construction.
Updates completed-jobs.json with job data and recalculates per-type averages.

Usage:
  python log-completed-job.py --type "Painting" --scope "2BR interior, walls + trim" \
    --location "Lincoln Park" --quoted 2400 --materials 320 --hours 18 --labor-rate 50 \
    --notes "Client wanted extra coat on trim"
"""

import json
import argparse
import os
from datetime import datetime

DATA_FILE = r"C:\Users\trisd\clawd\data\completed-jobs.json"


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"jobs": [], "summaryByType": {}}


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def generate_id(data):
    year = datetime.now().year
    count = len(data["jobs"]) + 1
    return f"VCJ-{year}-{count:03d}"


def recalculate_summaries(data):
    """Recalculate per-type averages from all jobs."""
    by_type = {}

    for job in data["jobs"]:
        ptype = job["projectType"]
        if ptype not in by_type:
            by_type[ptype] = {
                "jobCount": 0,
                "totalQuoted": 0,
                "totalActualCost": 0,
                "totalHours": 0,
                "totalProfit": 0,
                "sqftJobs": 0,
                "totalSqft": 0,
            }

        stats = by_type[ptype]
        stats["jobCount"] += 1
        stats["totalQuoted"] += job.get("quotedPrice", 0)
        stats["totalActualCost"] += job.get("totalActualCost", 0)
        stats["totalHours"] += job.get("actualLaborHours", 0)
        stats["totalProfit"] += job.get("actualProfit", 0)

        if job.get("sqft", 0) > 0:
            stats["sqftJobs"] += 1
            stats["totalSqft"] += job["sqft"]

    # Calculate averages
    summaries = {}
    for ptype, stats in by_type.items():
        n = stats["jobCount"]
        summary = {
            "jobCount": n,
            "avgQuoted": round(stats["totalQuoted"] / n, 2),
            "avgActualCost": round(stats["totalActualCost"] / n, 2),
            "avgHours": round(stats["totalHours"] / n, 1),
            "avgProfitMargin": round(
                (stats["totalProfit"] / stats["totalQuoted"] * 100) if stats["totalQuoted"] > 0 else 0, 1
            ),
        }
        if stats["sqftJobs"] > 0 and stats["totalSqft"] > 0:
            summary["avgQuotedPerSqFt"] = round(stats["totalQuoted"] / stats["totalSqft"], 2)
            summary["avgActualCostPerSqFt"] = round(stats["totalActualCost"] / stats["totalSqft"], 2)

        summaries[ptype] = summary

    data["summaryByType"] = summaries


def main():
    parser = argparse.ArgumentParser(description="Log a completed job for Valencia Construction")
    parser.add_argument("--type", required=True, help="Project type (e.g. Painting, Drywall, Kitchen Remodel)")
    parser.add_argument("--scope", required=True, help="Scope description")
    parser.add_argument("--location", default="Chicago", help="Job location")
    parser.add_argument("--sqft", type=float, default=0, help="Square footage (if applicable)")
    parser.add_argument("--quoted", type=float, required=True, help="Price quoted to client")
    parser.add_argument("--materials", type=float, default=0, help="Actual material cost")
    parser.add_argument("--hours", type=float, default=0, help="Actual labor hours")
    parser.add_argument("--labor-rate", type=float, default=50, help="Hourly labor cost (default $50)")
    parser.add_argument("--sub-cost", type=float, default=0, help="Subcontractor costs")
    parser.add_argument("--satisfaction", default="", help="Client satisfaction (e.g. 5/5)")
    parser.add_argument("--notes", default="", help="Lessons learned or notes")

    args = parser.parse_args()

    data = load_data()

    labor_cost = args.hours * args.labor_rate
    total_cost = args.materials + labor_cost + args.sub_cost
    profit = args.quoted - total_cost
    margin = round((profit / args.quoted * 100) if args.quoted > 0 else 0, 1)

    job = {
        "id": generate_id(data),
        "completedDate": datetime.now().strftime("%Y-%m-%d"),
        "projectType": args.type,
        "scope": args.scope,
        "location": args.location,
        "sqft": args.sqft,
        "quotedPrice": args.quoted,
        "actualMaterialCost": args.materials,
        "actualLaborHours": args.hours,
        "actualLaborCost": labor_cost,
        "actualSubCost": args.sub_cost,
        "totalActualCost": total_cost,
        "actualProfit": profit,
        "profitMargin": margin,
        "clientSatisfaction": args.satisfaction,
        "lessonsLearned": args.notes,
    }

    data["jobs"].append(job)
    recalculate_summaries(data)
    save_data(data)

    print(f"Logged job {job['id']}: {args.type} - {args.scope}")
    print(f"  Quoted: ${args.quoted:,.0f} | Actual Cost: ${total_cost:,.0f} | Profit: ${profit:,.0f} ({margin}%)")
    print(f"  Saved to {DATA_FILE}")


if __name__ == "__main__":
    main()
