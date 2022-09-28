import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { matcher } from 'matcher';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import { Provider } from 'next-auth/providers';
import DiscordProvider from 'next-auth/providers/discord';
import EmailProvider from 'next-auth/providers/email';
import FacebookProvider from 'next-auth/providers/facebook';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';

import { getUser } from '@/lib/cache';
import prisma, { getAppSettings } from '@/lib/prisma';

const PRODUCTION = process.env.NODE_ENV === 'production';

const providers: Provider[] = [
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM
    ? EmailProvider({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM
      })
    : null,
  process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
    ? DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'none'
          }
        }
      })
    : null,
  process.env.GITHUB_ID && process.env.GITHUB_SECRET
    ? GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET
      })
    : null,
  process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
    ? TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET
      })
    : null,
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET
      })
    : null,
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    : null
].filter((v) => v !== null);

if (providers.length === 0) console.log('!!! No provider options were given!');

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    error: '/login/error'
  },
  providers,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: `${PRODUCTION ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: PRODUCTION ? process.env.APP_HOSTNAME : undefined,
        secure: PRODUCTION
      }
    }
  },
  callbacks: {
    async signIn({ user }) {
      // If the superadmin attribute exists, then the user already had an account
      if (typeof user.superadmin === 'boolean') return true;

      const [appSettings] = await getAppSettings();
      if (!appSettings.allowNewUsers) throw new Error('RegisterClosed');

      // Give superadmin to new users with admin e-mail
      if (process.env.STUB_ADMIN_EMAIL === user.email) user.superadmin = true;

      // Match e-mails if given e-mails
      const hasWhitelistedEmails = appSettings.registerEmailFilters.filter((line) => line).length !== 0;
      if (hasWhitelistedEmails && (!user.email || !matcher(user.email, appSettings.registerEmailFilters))) return false;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.superadmin = user.superadmin;
        token.type = user.type;
      }

      return token;
    },
    async session({ session, token }) {
      const user = await getUser(token.sub);
      if (!user) throw new Error('User does not exist');
      session.user = {
        id: token.sub,
        ...session.user,
        name: user.name,
        email: user.email,
        picture: user.image,
        superadmin: user.superadmin,
        type: user.type
      };
      return session;
    }
  }
};

export default NextAuth(authOptions);
