import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sprinto Copy Generator",
  description: "LinkedIn ad copy powered by competitor intelligence",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
