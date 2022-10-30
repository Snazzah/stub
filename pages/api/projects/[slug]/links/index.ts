import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { addLink, getLinksForProject } from '@/lib/api/links';
import { withProjectAuth } from '@/lib/auth';

const schema = z.object({
  key: z.string().regex(/^(?:[\p{Letter}\p{Mark}\d/-]+|:index)$/u),
  url: z.string().url(),
  archived: z.boolean(),
  title: z.string().min(1).max(1024).nullish(),
  description: z.string().min(1).max(4096).nullish(),
  image: z.string().url().nullish(),
  password: z.string().min(1).nullish(),
  expiresAt: z.string().min(1).nullish()
});

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project, session) => {
  if (req.method === 'GET') {
    const { status, sort, userId } = req.query as {
      status?: string;
      sort?: 'createdAt' | 'clicks';
      userId?: string;
    };
    const response = await getLinksForProject({
      domain: project.domain,
      status,
      sort,
      userId
    });
    return res.status(200).json(response);
    // POST /api/links – create a new link
  } else if (req.method === 'POST') {
    if (!session?.user?.superadmin && !['member', 'manager', 'owner'].includes(project.users[0]?.role))
      return res.status(403).send({ error: 'Missing permissions' });
    const data = schema.safeParse(req.body);
    if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });
    const response = await addLink({
      ...(data.data as unknown as {
        key: string;
        url: string;
        archived: boolean;
        title: string | null;
        description: string | null;
        image: string | null;
        password: string | null;
        expiresAt: Date | null;
      }),
      domain: project.domain,
      userId: session.user.id,
      createdAt: new Date(),
      clicks: 0
    });
    if (response === null) {
      return res.status(400).json({ error: 'Key already exists' });
    }
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
