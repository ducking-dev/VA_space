/**
 * @file next.config.js
 * @description Next.js 설정
 * 성능 최적화: 압축, 최적화, 캐싱
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ========== Performance ==========
    
    // 압축 활성화
    compress: true,
  
    // 이미지 최적화
    images: {
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 60,
    },
  
    // ========== Build Optimization ==========
  
    // SWC 컴파일러 (Rust 기반, 매우 빠름)
    swcMinify: true,
  
    // 엄격 모드
    reactStrictMode: true,
  
    // Production 최적화
    productionBrowserSourceMaps: false,
  
    // ========== Experimental Features ==========
  
    experimental: {
      // 서버 액션
      serverActions: {
        bodySizeLimit: '2mb',
      },
    },
  
    // ========== Headers (캐싱 및 보안) ==========
  
    async headers() {
      return [
        {
          source: '/data/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=60, stale-while-revalidate=120',
            },
          ],
        },
      ];
    },
  
    // ========== Webpack Optimization ==========
  
    webpack: (config, { dev, isServer }) => {
      // Production 최적화
      if (!dev && !isServer) {
        // Tree shaking 강화
        config.optimization = {
          ...config.optimization,
          usedExports: true,
          sideEffects: false,
        };
      }
  
      return config;
    },
  };
  
  module.exports = nextConfig;