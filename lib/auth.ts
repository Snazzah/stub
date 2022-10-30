import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';

import prisma from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

declare module 'next-auth' {
  interface Session {
    user?: Record<string, any> & {
      email?: string | null;
      id?: string | null;
      name?: string | null;
      picture?: string | null;
      superadmin?: boolean;
      type?: string | null;
    };
  }

  interface User {
    email?: string | null;
    id?: string | null;
    name?: string | null;
    picture?: string | null;
    superadmin?: boolean;
    type?: string | null;
  }
}

interface Session {
  user: {
    email?: string | null;
    id?: string | null;
    name?: string | null;
    picture?: string | null;
    superadmin?: boolean;
    type?: string | null;
  };
}

export async function getSession(req: GetServerSidePropsContext['req'] | NextApiRequest, res: GetServerSidePropsContext['res'] | NextApiResponse) {
  const session = (await unstable_getServerSession(req, res, authOptions)) as Session | null;
  return session;
}

interface ProjectAuthProps {
  id: string;
  name: string;
  slug: string;
  domain: string;
  users: {
    role: string;
    userId: string;
  }[];
}

interface CustomNextApiHandler {
  (req: NextApiRequest, res: NextApiResponse, project: ProjectAuthProps, session: Session): Promise<void>;
}

const withProjectAuth =
  (handler: CustomNextApiHandler) =>
  // TODO - fix `handler` type when we figure it out
  // `isWriteEditLink` is only true when it's a POST or PUT request for links
  // (you can't add/edit a link when domain is not configured)
  // TODO readd isWriteEditLink whenever its relevant
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Missing or misconfigured project slug' });
    }

    const project = await prisma.project.findFirst({
      where: {
        slug,
        ...(session?.user?.superadmin
          ? {}
          : {
              users: {
                some: {
                  userId: session.user.id
                }
              }
            })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        users: {
          where: {
            userId: session.user.id
          },
          select: {
            userId: true,
            role: true
          }
        }
      }
    });

    if (!project) return res.status(401).end('Unauthorized');

    return handler(req, res, project, session);
  };

export { withProjectAuth };

export const serverSidePropsAuth: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session?.user) return { redirect: { destination: '/login' }, props: {} };
  return { props: { session } };
};
