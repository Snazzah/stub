import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';

import prisma from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

import { UserProps } from './types';

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

export interface Session {
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

const withProjectAuth = (handler: CustomNextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing or misconfigured project slug' });
  }

  const project = await prisma.project.findUnique({
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
  if (project) {
    // project exists but user is not part of it
    if (project.users.length === 0) {
      const pendingInvites = await prisma.projectInvite.findUnique({
        where: {
          email_projectId: {
            email: session.user.email,
            projectId: project.id
          }
        },
        select: {
          expires: true
        }
      });
      if (!pendingInvites) {
        return res.status(404).json({ error: 'Project not found' });
      } else if (pendingInvites.expires < new Date()) {
        return res.status(410).json({ error: 'Project invite expired' });
      } else {
        return res.status(409).json({ error: 'Project invite pending' });
      }
    }
  } else {
    // project doesn't exist
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!project) return res.status(401).end('Unauthorized');

  return handler(req, res, project, session);
};

interface WithUserNextApiHandler {
  (req: NextApiRequest, res: NextApiResponse, session: Session, user?: UserProps): Promise<void>;
}

const withUserAuth =
  (
    handler: WithUserNextApiHandler,
    {
      needUserDetails, // if the action needs the user's details
      needSuperadmin // if the action needs the user to be a superadmin
    }: {
      needUserDetails?: boolean;
      needSuperadmin?: boolean;
    } = {}
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

    if (req.method === 'GET') return handler(req, res, session);

    if (needSuperadmin && !session?.user?.superadmin) return res.status(401).send({ error: 'Unauthorized' });

    if (needUserDetails) {
      const user = (await prisma.user.findUnique({
        where: {
          id: session.user.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      })) as UserProps;

      return handler(req, res, session, user);
    }

    return handler(req, res, session);
  };

export { withProjectAuth, withUserAuth };

export const serverSidePropsAuth: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session?.user) return { redirect: { destination: '/login' }, props: {} };
  return { props: { session } };
};
