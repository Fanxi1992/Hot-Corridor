import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ['pbs.twimg.com'], // 添加 Twitter 图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '*',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default config;
