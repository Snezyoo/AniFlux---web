/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Allow cross-origin iframe embeds for video players (including Zoko Anime)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://player.vimeo.com https://zokoanime.video",
              // zokoanime.video added for Zoko HD streaming engine
              "frame-src 'self' https://zokoanime.video https://*.zokoanime.video https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://iframe.mediadelivery.net https://cloudflarestream.com https://*.cloudflarestream.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https: http:",
              "connect-src 'self' https: wss: http:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

