import { NextApiRequest, NextApiResponse } from 'next';

import { checkIfKeyExists } from '@/lib/api/links';
import { withProjectAuth } from '@/lib/auth';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  if (req.method === 'GET') {
    const { key } = req.query as { key: string };
    const response = await checkIfKeyExists(project.domain, key);
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
