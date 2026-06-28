#!/usr/bin/env python3
"""
Sprinto LinkedIn Ad Copy Generator

Usage:
    python generate_copy.py                          # interactive mode
    python generate_copy.py --creative "description" # pass creative description
    python generate_copy.py --update "new info"      # add to knowledge hub
"""

import os, sys, json, argparse
from pathlib import Path
from datetime import date

BASE_DIR = Path(__file__).parent
HUB_DIR  = BASE_DIR / "knowledge-hub"
DATA_DIR = BASE_DIR / "competitor-data"

def load_knowledge_hub():
    files = ["positioning.md", "proof.md", "personas.md", "competitors.md", "product.md", "updates.md"]
    hub = {}
    for f in files:
        path = HUB_DIR / f
        if path.exists():
            hub[f.replace(".md", "")] = path.read_text()
    return hub

def load_competitor_patterns():
    path = DATA_DIR / "patterns.json"
    if path.exists():
        return json.loads(path.read_text())
    return {}

def add_to_updates(info):
    path = HUB_DIR / "updates.md"
    today = date.today().strftime("%B %d, %Y")
    existing = path.read_text() if path.exists() else ""
    entry = f"\n## {today}\n{info}\n"
    if "_No updates yet_" in existing:
        existing = existing.replace("_No updates yet. Add new info here as it comes in._", "")
    path.write_text(existing + entry)
    print(f"Added to knowledge hub: {info[:60]}...")

def build_prompt(creative_desc, hub, patterns):
    competitor_summary = ""
    if patterns:
        competitor_summary = json.dumps(patterns, indent=2)[:3000]

    prompt = f"""You are writing LinkedIn ad copy for Sprinto - a compliance automation platform.

CREATIVE DESCRIPTION:
{creative_desc}

SPRINTO KNOWLEDGE HUB:

POSITIONING:
{hub.get("positioning", "")}

PROOF POINTS:
{hub.get("proof", "")}

TARGET PERSONAS:
{hub.get("personas", "")}

COMPETITOR DIFFERENTIATION:
{hub.get("competitors", "")}

PRODUCT:
{hub.get("product", "")}

RECENT UPDATES:
{hub.get("updates", "")}

COMPETITOR PATTERNS (what they are doing - use as reference for what NOT to copy):
{competitor_summary}

---

TASK: Write 3 LinkedIn ad copy variants for this creative.

RULES:
- Simple language. Short sentences. No jargon. Grade 7-8 reading level.
- Each variant uses a DIFFERENT angle: one proof-led, one pain-led, one outcome-led
- Hook must grab attention in the first line
- Do NOT copy competitor structure or language
- Play on Sprinto strengths - speed, guided support, continuous compliance, 100% audit success
- Use real proof points from the knowledge hub
- No hashtags. No emojis. No em dashes.
- Headline: under 150 characters
- Body: under 600 characters
- End with a clear CTA

FORMAT FOR EACH VARIANT:
---
VARIANT [N] - [ANGLE TYPE]
Headline: [headline text] ([char count] chars)
Body:
[body text]
CTA: [button text]
Why this works: [1 sentence]
---
"""
    return prompt

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--creative", help="Description of the creative/visual")
    parser.add_argument("--update", help="Add new info to knowledge hub")
    args = parser.parse_args()

    if args.update:
        add_to_updates(args.update)
        return

    hub = load_knowledge_hub()
    patterns = load_competitor_patterns()

    creative_desc = args.creative
    if not creative_desc:
        print("Describe the creative (visual/image):")
        creative_desc = input("> ").strip()
        if not creative_desc:
            print("No creative description provided.")
            sys.exit(1)

    print("\nGenerating copy...\n")
    prompt = build_prompt(creative_desc, hub, patterns)

    # Output the prompt for use with Claude
    print("=" * 60)
    print(prompt)
    print("=" * 60)
    print("\nPaste the above into Claude, or integrate with Anthropic API.")

if __name__ == "__main__":
    main()
