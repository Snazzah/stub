import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import { deleteLink, editLink } from '@/lib/redis';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project, session) => {
  if (!session?.user?.superadmin && !['member', 'manager', 'owner'].includes(project.users[0]?.role))
    return res.status(403).send({ error: 'Missing permissions' });

  const { key: oldKey } = req.query as { key: string };

  if (req.method === 'PUT') {
    const { key, url, title, timestamp, description, image } = req.body;
    if (!key || !url || !title || !timestamp) {
      return res.status(400).json({ error: 'Missing key or url or title or timestamp' });
    }
    const response = await editLink(project.domain, oldKey, key, {
      url,
      title,
      timestamp,
      description,
      image
    });
    if (response === null) {
      return res.status(400).json({ error: 'Key already exists' });
    }
    return res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    const response = await deleteLink(project.domain, oldKey);
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
