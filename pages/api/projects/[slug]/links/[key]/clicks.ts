import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLinkClicksCount } from '@/lib/redis';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  if (req.method === 'GET') {
    const { key } = req.query as { key: string };
    const clicks = await getLinkClicksCount(project.domain, key);
    await prisma.link.update({
      where: {
        domain_key: {
          domain: project.domain,
          key
        }
      },
      data: {
        clicks,
        clicksUpdatedAt: new Date()
      }
    });
    return res.status(200).json(clicks);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
