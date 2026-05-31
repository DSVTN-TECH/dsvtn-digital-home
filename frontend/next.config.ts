import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  images: {
    // Local brand/content placeholders are authored as SVG. Allow them through the
    // optimizer, but neutralize any embedded scripts via a strict CSP + sandbox.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
