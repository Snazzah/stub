import { NextApiRequest, NextApiResponse } from 'next';

import { archiveLink } from '@/lib/api/links';
import { withProjectAuth } from '@/lib/auth';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  const { key } = req.query as { key: string };

  if (req.method === 'PUT') {
    const response = await archiveLink(project.domain, key);
    return res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    const response = await archiveLink(project.domain, key, false);
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
