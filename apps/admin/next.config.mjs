import process from 'process';
import path from 'path';
import { createRequire } from 'module';
import withBundleAnalyzer from '@next/bundle-analyzer';

const require = createRequire(import.meta.url);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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

export default bundleAnalyzer(nextConfig);

