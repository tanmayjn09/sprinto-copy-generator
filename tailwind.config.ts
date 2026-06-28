import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sprinto: { DEFAULT: "#9B1B60", dark: "#7d1550" }
      }
    }
  },
  plugins: [],
}
export default config
