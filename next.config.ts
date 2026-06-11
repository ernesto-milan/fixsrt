import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Use the system certificate store when fetching webfonts at build time
    // (next/font/google). Some build environments ship a minimal cert bundle
    // that otherwise fails the TLS handshake to Google Fonts.
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
