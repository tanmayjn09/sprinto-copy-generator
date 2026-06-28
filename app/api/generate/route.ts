import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function loadHub() {
  const dir = path.join(process.cwd(), "knowledge-hub")
  const files = ["positioning", "proof", "personas", "competitors", "product", "updates"]
  return files.reduce((acc, f) => {
    const p = path.join(dir, `${f}.md`)
    acc[f] = fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : ""
    return acc
  }, {} as Record<string, string>)
}

function loadPatterns() {
  const p = path.join(process.cwd(), "competitor-data", "patterns.json")
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, "utf-8")) } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const image = form.get("image") as File | null
    const desc  = (form.get("description") as string) || ""

    const hub      = loadHub()
    const patterns = loadPatterns()

    const topHooks = patterns?.patterns?.common_hooks?.slice(0, 15)
      .map((h: { company: string; headline: string }) => `[${h.company}] ${h.headline}`)
      .join("\n") ?? ""

    const system = `You are Sprinto's LinkedIn ad copy expert. Write copy that is simple, direct, and grounded in real proof.

## SPRINTO KNOWLEDGE HUB

### Positioning
${hub.positioning}

### Proof Points
${hub.proof}

### Target Personas
${hub.personas}

### Competitor Differentiation
${hub.competitors}

### Product
${hub.product}

### Recent Updates
${hub.updates}

${topHooks ? `## COMPETITOR HEADLINES (reference only - do NOT copy structure or language)
${topHooks}` : ""}

## RULES
- Simple language. Short sentences. No jargon. Grade 7-8 reading level.
- Headline: under 150 characters
- Body: under 600 characters
- No hashtags. No emojis. No em dashes.
- Lead with ONE clear outcome or pain point
- Always use real proof points from the knowledge hub
- Never mirror competitor hooks above
- Produce 3 variants: Proof-Led, Pain-Led, Outcome-Led

## OUTPUT FORMAT
Return ONLY a valid JSON object, no markdown:
{"variants":[{"angle":"Proof-Led","headline":"...","body":"...","cta":"...","why":"..."},{"angle":"Pain-Led","headline":"...","body":"...","cta":"...","why":"..."},{"angle":"Outcome-Led","headline":"...","body":"...","cta":"...","why":"..."}]}`

    const content: Anthropic.MessageParam["content"] = []

    if (image) {
      const bytes  = await image.arrayBuffer()
      const b64    = Buffer.from(bytes).toString("base64")
      const mime   = image.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp"
      content.push({ type: "image", source: { type: "base64", media_type: mime, data: b64 } })
    }

    content.push({
      type: "text",
      text: image
        ? `Analyze this creative, then write 3 LinkedIn ad copy variants.${desc ? ` Context: ${desc}` : ""} Return only valid JSON.`
        : `Creative description: ${desc}\n\nWrite 3 LinkedIn ad copy variants. Return only valid JSON.`,
    })

    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 2000,
      system,
      messages:   [{ role: "user", content }],
    })

    const text  = response.content[0].type === "text" ? response.content[0].text : ""
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("No JSON in response")

    return NextResponse.json(JSON.parse(match[0]))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
