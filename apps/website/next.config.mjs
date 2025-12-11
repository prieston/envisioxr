import withBundleAnalyzer from '@next/bundle-analyzer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const webpack = require('webpack');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'prieston-prod.fra1.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Define compile-time constants for dead-code elimination
    const isDev = process.env.NODE_ENV === 'development';

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDev),
        __LOG_LEVEL__: JSON.stringify(isDev ? 'debug' : 'warn'),
        DEBUG_SENSORS: JSON.stringify(false), // Website doesn't use Cesium sensors
      })
    );

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

