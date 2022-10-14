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
      'avatars.dicebear.com',
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
  }
};
