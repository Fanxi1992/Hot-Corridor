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
        // 添加以下配置
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
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
