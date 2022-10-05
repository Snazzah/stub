import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { withProjectAuth } from '@/lib/auth';
import { deleteLink, editLink } from '@/lib/redis';
import { LinkProps } from '@/lib/types';

const schema = z
  .object({
    key: z.string().regex(/^(?:[\p{Letter}\p{Mark}\d-]+|:index)$/u),
    url: z.string().url(),
    title: z.string().min(1).max(1024),
    timestamp: z.number().min(1),
    description: z.string().min(1).max(4096).optional(),
    image: z.string().url().optional()
  })
  .strict();

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project, session) => {
  if (!session?.user?.superadmin && !['member', 'manager', 'owner'].includes(project.users[0]?.role))
    return res.status(403).send({ error: 'Missing permissions' });

  const { key: oldKey } = req.query as { key: string };

  if (req.method === 'PUT') {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing key' });
    const data = schema.safeParse(req.body);
    if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });
    const response = await editLink(project.domain, oldKey, key, data.data as Omit<LinkProps, 'key'>);
    if (response === null) return res.status(400).json({ message: 'Key already exists', data: { key: { _errors: ['Key already exists'] } } });
    return res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    const response = await deleteLink(project.domain, oldKey);
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
