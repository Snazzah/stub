import { NextApiRequest, NextApiResponse } from 'next';

import { getLinkCountForProject } from '@/lib/api/links';
import { withProjectAuth } from '@/lib/auth';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  // GET /api/projects/[slug]/links/count – count the number of links for a project
  if (req.method === 'GET') {
    const count = await getLinkCountForProject(project.domain);
    return res.status(200).json(count);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
