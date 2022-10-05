import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { withProjectAuth } from '@/lib/auth';
import { addLink, getLinksForProject } from '@/lib/redis';

const schema = z
  .object({
    key: z.string().regex(/^(?:[\p{Letter}\p{Mark}\d-]+|:index)$/u),
    url: z.string().url(),
    title: z.string().min(1).max(1024),
    description: z.string().min(1).max(4096).optional(),
    image: z.string().url().optional()
  })
  .strict();

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project, session) => {
  if (req.method === 'GET') {
    const links = await getLinksForProject(project.domain);
    return res.status(200).json(links);
    // POST /api/links – create a new link
  } else if (req.method === 'POST') {
    if (!session?.user?.superadmin && !['member', 'manager', 'owner'].includes(project.users[0]?.role))
      return res.status(403).send({ error: 'Missing permissions' });
    const { key, url, title, description, image } = req.body;
    const data = schema.safeParse(req.body);
    if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });
    const response = await addLink(project.domain, url, key, { title, description, image });
    if (response === null) {
      return res.status(400).json({ error: 'Key already exists' });
    }
    return res.status(200).json({ key, url, title, description, image });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
