<div align="center">
  <img src="/public/static/logo.svg" alt="logo" height=100 />

  # Stub

  A self-hostable modified fork of [Dub](https://github.com/steven-tey/dub): An open-source link shortener.

</div>

<div align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#why-a-fork-of-dub"><strong>Why a fork?</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy your Own</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</div>
<br/>

## Introduction

Stub is a heavily modified fork of [Dub](https://github.com/steven-tey/dub): An open-source link shortener with built-in analytics using Next.js and Redis.
> **Warning** This is still a work in progress. For a single-user instance, this works fine. User management doesn't exist yet.

## Why a fork of Dub?
Dub relies a lot on serverless services (Vercel, Upstash) and wasn't all that good to self-host on your own server. Stub serves to have a nice link shortener like Dub that can be hosted on your own server.

## Differences
- References to separate plans and Stripe was removed.
- `@upstash/redis` was replaced with `ioredis`, which caused a bit of problems and I ended up restrcturing link routing like in the next point.
- Dub uses Next.js middleware to route links, but the middleware itself is limited to edge functionality, which wouldn't work for Redis outside of Upstash's Redis client (which is just calling endpoints). The router was insteda made into a separate node HTTP server hosted on a separate port (default `3001`). This can also allow for index links in the future.
- Users now have types, with users being able to be [superadmins](https://get.snaz.in/4oXYvT9.png), or regular admins that can create projects. By default, users cannot create projects and will have to be invited to other projects by managers. This system is somewhat similar to Weblate.
  - Superadmins have control of instance-wide settings, like enabling or disabling new users, or limiting new users to certain e-mails. ([example](https://get.snaz.in/3wPaYvt.png))
- Stub supports more login methods other than magic link e-mails, like Discord or GitHub OAuth logins.

## Tech Stack

- [Next.js](https://nextjs.org/) – framework
- [Typescript](https://www.typescriptlang.org/) – language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Redis](https://redis.io/) – database
- [NextAuth.js](https://next-auth.js.org/) – auth

## Implementation

Stub is split into two applications, the app itself and the router. The router is a basic HTTP server that route links and handle clicks. [Dub](https://github.com/steven-tey/dub) uses Next.js middleware to route links, but middleware itself is limited to edge functionality.

[Redis](https://redis.io/) is used as the database for storing links and analytics data, which works well for key-value data types. Redis also has the Sorted Set data type, which is perfect for storing & retrieving time-series analytics data. Here's the full schema:

- `{hostname}:links` – hashmap of all links for a given hostname (e.g. `dub.sh:links`)
- `{hostname}:links:timestamps` – sorted set of all link timestamps for a given hostname (e.g. `dub.sh:links:timestamps`)
- `{hostname}:clicks:{linkId}` – sorted set of all clicks for a given link (e.g. `dub.sh:clicks:github`)
- `{hostname}:root:clicks` – sorted set of all root link clicks for a given hostname (e.g. `dub.sh:root:clicks`)

## Deploy Your Own
### Manual
Make sure you have Node.js v16 installed. You could install newer versions of Node, but [next-auth is restricted to some versions](https://github.com/nextauthjs/next-auth/blob/ac5d8a9795be64f2c096751e388a7303f284e703/package.json#L43) and you will need to add `--ignore-engines` while installing dependencies.

You can build Stub with these commands:
```sh
git clone https://github.com/Snazzah/stub
cd stub
yarn install # --ignore-engines
yarn migrate
yarn generate
yarn build
```

From here, you can launch the app with `yarn start` and launch the router with `yarn start:router`. You can also start both with `yarn start:all`.

If you have filled in the `STUB_ADMIN_EMAIL` environment variable and logged in with your authentication provider of choice, you should see a [shield next to your profile picture](https://get.snaz.in/4oXYvT9.png) showing that you are a superadmin, and can create projects. If not, you can run `yarn manage set-superadmin something@example.com` to set that user with that e-mail as a superadmin.

After creating a project, you can make sure that domain is being pointed from the router port (default `3001`, can be set from `ROUTER_PORT`) and you can check your [project settings](https://get.snaz.in/7bkV41c.png) to confirm if that domain works.

### Docker
```sh
npx degit github:Snazzah/stub/docker stub-docker
cd stub-docker
# Fill out the .env variables
docker-compose up -d
```

#### Upgrading docker containers
You can do this by sticking with the existing docker-compose and just pull the latest images and then restart:
```sh
# Fetch latest versions of the images
docker-compose pull
# Stop and destroy the containers
docker-compose down
# Spawn new containers in the background
docker-compose up -d
# Follow the logs during upgrade
docker-compose logs -f
```
## Contributing

- [Open an issue](https://github.com/Snazzah/stub/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/Snazzah/stub/pull) to add new features/make quality-of-life improvements/fix bugs.

## License

Just like Dub, Stub is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. You can [find it here](https://github.com/Snazzah/stub/blob/master/LICENSE.md).
