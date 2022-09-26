import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

  const { domain } = req.query as { domain: string };

  // GET /api/domains/[domain]/verify – check if a domain works on this instance
  if (req.method === 'GET') {
    const response = await fetch(`http://${domain}/_stub`, { method: 'HEAD', headers: { 'X-Stub-Matches-App': process.env.APP_HOSTNAME } }).catch(
      () => ({ status: null })
    );
    return res.status(200).json(response.status === 204);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
