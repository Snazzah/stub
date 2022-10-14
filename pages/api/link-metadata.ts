import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';
import { getMetadataFromUrl } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    const url = req.query.url;
    if (!url || typeof url !== 'string') return res.status(400).send({ error: 'Missing url' });
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).send({ error: 'Invalid URL' });
    }
    const metadata = await getMetadataFromUrl(url);
    return res.status(200).send(metadata);
  } else {
    return res.status(405).send({ error: `Method ${req.method} Not Allowed` });
  }
}
