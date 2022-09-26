import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { changeDomain } from '@/lib/redis';
import { validDomainRegex } from '@/lib/utils';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  if (req.method === 'PUT') {
    const { slug } = req.query as { slug: string };
    const domain = project.domain;
    const newDomain = req.body;

    const validDomain = typeof newDomain === 'string' ? validDomainRegex.test(newDomain) : false;
    if (!validDomain)
      return res.status(422).json({
        domainError: 'Invalid domain'
      });

    if (domain !== newDomain) {
      // make sure domain doesn't exist
      const project = await prisma.project.findUnique({
        where: {
          domain: newDomain
        },
        select: { slug: true }
      });
      if (project && project.slug !== slug) {
        return res.status(400).json({ error: 'Domain already exists' });
      }
      const [upstashResponse, prismaResponse] = await Promise.all([
        changeDomain(domain, newDomain),
        prisma.project.update({
          where: {
            slug
          },
          data: {
            domain: newDomain
          }
        })
      ]);

      return res.status(200).json({
        upstashResponse,
        prismaResponse
      });
    }
    return res.status(200).json({ message: 'Domains are the same' });
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
