import process from 'process';
import path from 'path';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from '@ducanh2912/next-pwa';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * A fork of 'next-pwa' that has app directory support
 * @see https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575
 */
const pwa = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  images: {},
  experimental: {
    esmExternals: 'loose'
  },
  transpilePackages: [
    '@envisio/engine-three',
    '@envisio/engine-cesium',
    '@envisio/core',
    '@envisio/ion-sdk',
    '@envisio/ui'
  ],
  // Optimize output for better performance
  output: 'standalone',
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  webpack(config, { isServer, webpack: _webpack }) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': '.',
        // Force single Three.js instance across workspace
        'three': path.resolve(process.cwd(), 'node_modules/three')
      },
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
      },
    };

    if (!isServer) {
      config.externals.push('sharp');
    }

    // Prevent webpack from parsing Cesium's pre-built chunk files from node_modules
    config.module.rules.push({
      test: /chunk-[A-Z0-9]+\.js$/,
      include: /node_modules/,
      use: ['file-loader'],
      type: 'javascript/auto',
    });

    // Enhanced Cesium asset handling
    config.module.rules.push({
      test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
      include: /node_modules\/cesium/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        },
      }],
    });

    // Handle Cesium CSS files specifically
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules\/cesium/,
      use: ['style-loader', 'css-loader'],
    });

    // Handle other CSS files
    config.module.rules.push({
      test: /\.css$/,
      exclude: /node_modules\/cesium/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: './postcss.config.cjs'
            }
          }
        }
      ],
    });

    // Audio file handling
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: config.inlineImageLimit,
            fallback: 'file-loader',
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // Shader file handling
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Note: Cesium assets are pre-copied to public/cesium/ and committed to git
    // No need to copy during build - prevents webpack from processing them

    // Enhanced webpack optimization for Cesium
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            cesium: {
              test: /[\\/]node_modules[\\/]cesium[\\/]/,
              name: 'cesium',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 9,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
            },
          },
        },
        runtimeChunk: {
          name: 'runtime',
        },
      };
    }

    return config;
  },
};

const KEYS_TO_OMIT = ['webpackDevMiddleware', 'configOrigin', 'target', 'analyticsId', 'webpack5', 'amp', 'assetPrefix'];

export default (_phase, { defaultConfig }) => {
  const plugins = [[pwa], [bundleAnalyzer, {}]];

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  });

  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });

  return finalConfig;
};