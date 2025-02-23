// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@thirdweb-dev/react',
    '@thirdweb-dev/sdk',
    '@walletconnect/core'
  ],
  experimental: {
    webpackBuildWorker: true,
    serverComponentsExternalPackages: ['pino-pretty']
  }
}

export default nextConfig