/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'logo.clearbit.com',
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
