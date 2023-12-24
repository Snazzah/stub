let revision = '<revision unknown>';
if (!process.env.GIT_REVISION) {
  try {
    revision = require('child_process').execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();
  } catch (e) {}
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    GIT_REVISION: process.env.GIT_REVISION || revision
  },
  images: {
    domains: [
      'www.google.com',
      'avatar.tobi.sh',
      'faisalman.github.io',
      'api.dicebear.com',
      'cdn.discordapp.com',
      'avatars.githubusercontent.com',
      'pbs.twimg.com'
    ]
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/',
        permanent: false
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ];
  }
};
