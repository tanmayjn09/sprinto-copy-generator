#!/usr/bin/env python3
"""
Pulls latest competitor ad copy from the gallery repo and extracts patterns.
Run this to keep competitor-data/patterns.json fresh.

Usage:
    python sync_competitor_data.py --source /path/to/sprinto-ads-report
"""

import json, argparse, re
from pathlib import Path
from datetime import date
from collections import Counter

def extract_patterns(copy_data):
    hooks, ctas, offer_types, formats = [], [], Counter(), Counter()

    for company, ads in copy_data.items():
        if not isinstance(ads, list):
            continue
        for ad in ads:
            headline = (ad.get("headline") or "").strip()
            body = (ad.get("body") or "").strip()
            cta = (ad.get("cta") or "").strip()
            offer = (ad.get("offer_type") or "").strip()
            fmt = (ad.get("ad_type") or "").strip()

            if headline: hooks.append({"company": company, "headline": headline, "body": body[:200]})
            if cta: ctas.append(cta)
            if offer: offer_types[offer] += 1
            if fmt: formats[fmt] += 1

    # Deduplicate CTAs
    cta_counts = Counter(ctas)

    return {
        "common_hooks": hooks[:50],  # latest 50 headlines across competitors
        "common_ctas": [{"cta": k, "count": v} for k, v in cta_counts.most_common(10)],
        "offer_types": dict(offer_types.most_common()),
        "formats": dict(formats.most_common()),
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, help="Path to sprinto-ads-report directory")
    args = parser.parse_args()

    source = Path(args.source)
    copy_file = source / "output" / "competitor_copy_with_images.json"
    if not copy_file.exists():
        print(f"Not found: {copy_file}")
        return

    copy_data = json.loads(copy_file.read_text())
    patterns = extract_patterns(copy_data)

    out = Path(__file__).parent / "competitor-data" / "patterns.json"
    out.write_text(json.dumps({
        "_note": "Auto-populated by sync_competitor_data.py",
        "_source": str(copy_file),
        "last_updated": date.today().isoformat(),
        "patterns": patterns
    }, indent=2))
    print(f"Synced {sum(len(v) if isinstance(v,list) else 0 for v in patterns.values())} patterns -> {out}")

if __name__ == "__main__":
    main()
