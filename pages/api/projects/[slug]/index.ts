import { NextApiRequest, NextApiResponse } from 'next';

import { deleteProjectLinks } from '@/lib/api/links';
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
        slug
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
    if (!projectAndUsers || (projectAndUsers.users[0].role !== 'owner' && !session.user.superadmin)) {
      return res.status(404).json({ error: 'Project not found' });
    } else {
      const { users, ...project } = projectAndUsers;
      return res.status(200).json({ project, user: users[0] });
    }

    // PUT /api/projects/[slug] – edit a project
  } else if (req.method === 'PUT') {
    return res.status(200).send('TODO');
    // DELETE /api/projects/[slug] – delete a project
  } else if (req.method === 'DELETE') {
    const project = await prisma.project.findFirst({
      where: {
        slug
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
    if (!project || !project.users.length) return res.status(404).json({ error: 'Project not found' });
    if (project.users[0].role !== 'owner' && !session.user.superadmin) return res.status(401).json({ error: 'Missing permissions' });
    await Promise.all([
      prisma.project.delete({
        where: { id: project.id }
      }),
      deleteProjectLinks(project.domain)
    ]);
    return res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
