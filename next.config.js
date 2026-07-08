/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      // Supabase storage (uploaded avatars) — hosted + local dev
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
    ],
  },
}

module.exports = nextConfig
