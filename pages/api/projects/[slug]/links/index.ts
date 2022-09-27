import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import { addLink, getLinksForProject } from '@/lib/redis';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  if (req.method === 'GET') {
    const links = await getLinksForProject(project.domain);
    return res.status(200).json(links);
    // POST /api/links – create a new link
  } else if (req.method === 'POST') {
    const { key, url, title, description, image } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing url' });
    if (!key || !/^(?:[a-zA-Z0-9\-/]+|:index)$/.test(key)) return res.status(400).json({ error: 'Invalid key' });
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
