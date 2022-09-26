import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

  const { slug } = req.query;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing or misconfigured project slug' });
  }

  // GET /api/projects/[slug] – get a specific project with it's links
  if (req.method === 'GET') {
    const projectAndUsers = await prisma.project.findFirst({
      where: {
        slug,
        users: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        users: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        }
      }
    });
    if (projectAndUsers) {
      const { users, ...project } = projectAndUsers;
      return res.status(200).json({ project, user: users[0] });
    } else {
      return res.status(404).json({ error: 'Project not found' });
    }

    // PUT /api/projects/[slug] – edit a project
  } else if (req.method === 'PUT') {
    return res.status(200).send('TODO');
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
