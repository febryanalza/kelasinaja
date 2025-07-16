/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'unzfpxkwehbbsvotdgen.supabase.co',
      'upload.wikimedia.org',
      'cdn-icons-png.flaticon.com',
      'storage.googleapis.com',
      'seeklogo.com',
      // Avatar dan image hosting services
      'www.cartoonize.net',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'scontent.xx.fbcdn.net',
      'secure.gravatar.com',
      'www.gravatar.com',
      'ui-avatars.com',
      'robohash.org',
      'i.pravatar.cc',
      'cloudinary.com',
      'res.cloudinary.com',
      'imgur.com',
      'i.imgur.com',
      'cdn.pixabay.com',
      'www.w3schools.com',
      'example.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    appDir: true,
  },
  // Headers untuk keamanan
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig