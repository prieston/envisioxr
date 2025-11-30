import process from 'process';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextConfig = {
  transpilePackages: [
    '@klorad/ui',
  ],
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3002',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
  },
};

// Conditionally apply bundle analyzer only when ANALYZE is enabled and package is available
let config = nextConfig;
if (process.env.ANALYZE === 'true') {
  try {
    const bundleAnalyzerModule = require('@next/bundle-analyzer');
    const withBundleAnalyzer = bundleAnalyzerModule.default || bundleAnalyzerModule;
    config = withBundleAnalyzer({ enabled: true })(nextConfig);
  } catch (e) {
    // Bundle analyzer not available, continue without it
    // This happens in production builds where devDependencies aren't installed
  }
}

export default config;

