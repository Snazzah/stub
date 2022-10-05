import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validDomainRegex } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

  // GET /api/projects – get all projects associated with the authenticated user
  if (req.method === 'GET') {
    const response = await prisma.project.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    });
    return res.status(200).json(response);

    // POST /api/projects – create a new project
  } else if (req.method === 'POST') {
    if (!session.user?.superadmin && session.user?.type !== 'admin') return res.status(401).json({ error: 'Missing permissions' });
    const { name, slug, domain } = req.body;
    if (!name || !slug || !domain) return res.status(422).json({ error: 'Missing name or slug or domain' });
    const slugError = !/^[a-zA-Z0-9-]+$/.test(slug) ? 'Slug cannot contain spaces or periods' : null;
    const validDomain = validDomainRegex.test(domain);
    if (slugError || !validDomain) {
      return res.status(422).json({
        slugError,
        domainError: validDomain ? null : 'Invalid domain'
      });
    }

    try {
      const project = await prisma.project.create({
        data: {
          name,
          slug,
          domain,
          users: {
            create: {
              userId: session.user.id,
              role: 'owner'
            }
          }
        }
      });
      return res.status(200).json({ project });
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(400).json({ error: 'Project slug already exists' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
