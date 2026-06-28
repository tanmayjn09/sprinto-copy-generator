# Sprinto Copy Generator

LinkedIn ad copy generator grounded in Sprinto's knowledge hub and competitor intelligence.

## How it works

1. You share a creative (image or description of the visual)
2. The generator reads Sprinto's knowledge hub and competitor patterns
3. Outputs 3 copy variants - proof-led, pain-led, outcome-led
4. Simple language. No jargon. LinkedIn format with character counts.

## Usage

### Generate copy for a creative
Open this repo in Claude Code and describe your creative:
> "Dark background, headline says 'SOC 2 in weeks not months', shows a dashboard screenshot"

Claude reads the knowledge hub and writes 3 variants.

### Add to knowledge hub
Tell Claude anything new:
> "Add to knowledge hub: we just won G2 Best ROI badge for Summer 2026"

It saves to `knowledge-hub/updates.md` with today's date. Gets used in all future copy.

### Sync competitor data
Run this when you want fresh competitor patterns from the gallery:
```bash
python sync_competitor_data.py --source /path/to/sprinto-ads-report
```

## Knowledge hub files
| File | What it contains |
|------|-----------------|
| `positioning.md` | Core message, taglines, value prop |
| `proof.md` | Stats, customer outcomes, G2 badges, quotes |
| `personas.md` | ICP, buyer personas, trigger events |
| `competitors.md` | How we differ from Vanta, Drata, Secureframe |
| `product.md` | Features and capabilities |
| `updates.md` | Daily additions - new wins, product updates, news |

## Copy rules enforced
- Simple language (Grade 7-8 reading level)
- Headline under 150 characters
- Body under 600 characters
- 3 variants per creative: proof-led, pain-led, outcome-led
- No hashtags, no emojis, no em dashes
- Always grounded in real proof points
