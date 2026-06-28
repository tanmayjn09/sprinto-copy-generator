/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate":    ["./knowledge-hub/**", "./competitor-data/**"],
      "/api/update-hub":  ["./knowledge-hub/**"],
    },
  },
}
export default nextConfig
