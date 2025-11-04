import withBundleAnalyzer from '@next/bundle-analyzer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Strip console.* in production
    if (!isServer && process.env.NODE_ENV === 'production') {
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization = {
        ...config.optimization,
        minimizer: [
          ...(config.optimization?.minimizer || []),
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
            },
          }),
        ],
      };
    }
    return config;
  },
};

export default bundleAnalyzer(nextConfig);

