/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'bin.bnbstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.kraken.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bitstamp.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'rabby.io',
      },
      {
        protocol: 'https',
        hostname: 'phantom.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'phantom.app',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'brave.com',
      },
      {
        protocol: 'https',
        hostname: 'trustwallet.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'lib/stubs/async-storage-web.js'),
      // WalletConnect/Reown resolve uint8arrays from nested node_modules; npm hoists it to root.
      uint8arrays: path.resolve(__dirname, 'node_modules/uint8arrays'),
    };
    config.module.rules.unshift({
      test: /\.svg$/,
      oneOf: [
        {
          resourceQuery: /react/,
          use: [
            {
              loader: '@svgr/webpack',
              options: { replaceAttrValues: {}, svgProps: { fill: 'currentColor' } },
            },
          ],
        },
        { type: 'asset/resource' },
      ],
    });
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

