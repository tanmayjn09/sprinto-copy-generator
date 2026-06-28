import { NextRequest, NextResponse } from "next/server"

const REPO  = process.env.GITHUB_REPO  ?? "tanmayjn09/sprinto-copy-generator"
const TOKEN = process.env.GITHUB_TOKEN ?? ""
const FILE  = "knowledge-hub/updates.md"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 })

    // Get current file
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
    })
    const fileData = await getRes.json()
    const current  = Buffer.from(fileData.content, "base64").toString("utf-8")

    // Append entry
    const today   = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const updated = current.replace("_No updates yet. Add new info here as it comes in._", "").trimEnd()
      + `\n\n## ${today}\n${text.trim()}\n`

    // Push back
    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `update: knowledge hub - ${text.slice(0, 60)}`,
        content: Buffer.from(updated).toString("base64"),
        sha:     fileData.sha,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
