/** @type {import('next').NextConfig} */

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
    ],
  },
  webpack: (config, { isServer }) => {
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
      // Ignore optional dependencies that are not needed for browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

