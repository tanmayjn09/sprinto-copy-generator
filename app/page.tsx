"use client"
import { useState, useRef, useCallback } from "react"

interface Variant {
  angle: string
  headline: string
  body: string
  cta: string
  why: string
}

const ANGLE_STYLES: Record<string, string> = {
  "Proof-Led":   "bg-blue-50 text-blue-700 border-blue-200",
  "Pain-Led":    "bg-red-50 text-red-700 border-red-200",
  "Outcome-Led": "bg-green-50 text-green-700 border-green-200",
}

export default function Home() {
  const [image, setImage]             = useState<File | null>(null)
  const [preview, setPreview]         = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [loading, setLoading]         = useState(false)
  const [variants, setVariants]       = useState<Variant[]>([])
  const [error, setError]             = useState("")
  const [hubText, setHubText]         = useState("")
  const [hubLoading, setHubLoading]   = useState(false)
  const [hubDone, setHubDone]         = useState(false)
  const [copied, setCopied]           = useState<string | null>(null)
  const [dragging, setDragging]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setVariants([])
    setError("")
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const generate = async () => {
    if (!image && !description.trim()) { setError("Upload a creative or describe it."); return }
    setLoading(true); setError(""); setVariants([])
    try {
      const form = new FormData()
      if (image) form.append("image", image)
      if (description) form.append("description", description)
      const res = await fetch("/api/generate", { method: "POST", body: form })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVariants(data.variants ?? [])
    } catch { setError("Generation failed. Check your API key or try again.") }
    finally { setLoading(false) }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const addToHub = async () => {
    if (!hubText.trim()) return
    setHubLoading(true)
    try {
      await fetch("/api/update-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hubText }),
      })
      setHubText(""); setHubDone(true)
      setTimeout(() => setHubDone(false), 3000)
    } finally { setHubLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#9B1B60] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Sprinto Copy Generator</h1>
            <p className="text-xs text-gray-400">LinkedIn ad copy - grounded in competitor intelligence</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── LEFT: Input ── */}
        <div className="space-y-4">

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging ? "border-[#9B1B60] bg-pink-50 scale-[1.01]"
              : preview  ? "border-[#9B1B60] bg-pink-50"
              : "border-gray-200 hover:border-[#9B1B60] bg-white"
            }`}
          >
            {preview ? (
              <>
                <img src={preview} alt="creative" className="max-h-56 mx-auto rounded-xl object-contain" />
                <p className="text-xs text-gray-400 mt-3">Click to change</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Drop creative here</p>
                <p className="text-xs text-gray-400 mt-1">or click to upload - PNG, JPG, WebP</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {/* Context */}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context - e.g. targeting CISOs, promoting speed to SOC 2, dark background with dashboard"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B1B60] focus:border-transparent bg-white resize-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={generate}
            disabled={loading || (!image && !description.trim())}
            className="w-full bg-[#9B1B60] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#7d1550] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing creative + competitor patterns...
              </span>
            ) : "Generate Copy"}
          </button>

          {/* Knowledge hub */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Add to Knowledge Hub</p>
            <p className="text-xs text-gray-500 mb-3">New win, product update, customer stat - anything that should inform future copy.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={hubText}
                onChange={(e) => setHubText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addToHub()}
                placeholder='e.g. "Won G2 Best ROI badge Summer 2026"'
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B1B60] focus:border-transparent"
              />
              <button
                onClick={addToHub}
                disabled={hubLoading || !hubText.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                {hubLoading ? "..." : hubDone ? "Added!" : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Output ── */}
        <div className="space-y-4">
          {loading && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-8 h-8 border-2 border-[#9B1B60] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Reading competitor patterns and knowledge hub...</p>
            </div>
          )}

          {!loading && variants.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p className="text-sm text-gray-400">Upload a creative and click Generate.</p>
              <p className="text-xs text-gray-300 mt-1">3 variants will appear here - proof-led, pain-led, outcome-led.</p>
            </div>
          )}

          {variants.map((v, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ANGLE_STYLES[v.angle] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {v.angle}
                </span>
                <span className="text-xs text-gray-300">Variant {i + 1}</span>
              </div>

              {/* Headline */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-400">Headline <span className={v.headline.length > 150 ? "text-red-500" : ""}>{v.headline.length}/150</span></span>
                  <button onClick={() => copy(v.headline, `h${i}`)} className="text-xs text-[#9B1B60] hover:underline">{copied===`h${i}` ? "Copied!" : "Copy"}</button>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{v.headline}</p>
              </div>

              {/* Body */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-400">Body <span className={v.body.length > 600 ? "text-red-500" : ""}>{v.body.length}/600</span></span>
                  <button onClick={() => copy(v.body, `b${i}`)} className="text-xs text-[#9B1B60] hover:underline">{copied===`b${i}` ? "Copied!" : "Copy"}</button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{v.body}</p>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-xs text-gray-400 font-medium">CTA</span>
                <span className="text-sm font-semibold text-[#9B1B60]">{v.cta}</span>
              </div>

              {/* Why */}
              <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3">{v.why}</p>

              {/* Copy all */}
              <button
                onClick={() => copy(`Headline:\n${v.headline}\n\nBody:\n${v.body}\n\nCTA: ${v.cta}`, `a${i}`)}
                className="w-full text-xs text-gray-400 border border-gray-100 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                {copied===`a${i}` ? "Copied!" : "Copy all"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
