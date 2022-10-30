import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { deleteLink, editLink } from '@/lib/api/links';
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
  if (!session?.user?.superadmin && !['member', 'manager', 'owner'].includes(project.users[0]?.role))
    return res.status(403).send({ error: 'Missing permissions' });

  const { key: oldKey } = req.query as { key: string };

  if (req.method === 'PUT') {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing key' });
    const data = schema.safeParse(req.body);
    if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });
    const response = await editLink(
      {
        ...req.body,
        domain: project.domain,
        userId: session.user.id
      },
      oldKey
    );
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
