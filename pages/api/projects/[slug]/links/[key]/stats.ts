import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import { checkIfKeyExists, redis } from '@/lib/redis';
import { intervalData, IntervalProps, processData, RawStatsProps } from '@/lib/stats';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project) => {
  if (req.method === 'GET') {
    const { key, interval } = req.query as {
      key: string;
      interval: IntervalProps;
    };
    const keyExists = Boolean(await checkIfKeyExists(project.domain, key));
    if (!keyExists) return res.status(404).json({ error: 'Link does not exist' });
    const start = Date.now() - intervalData[interval || '7d'].milliseconds;
    const end = Date.now();
    const response = await redis
      .zrange(`${project.domain}:clicks:${key}`, start, end, 'BYSCORE')
      .then((r) => r.map((s) => JSON.parse(s) as RawStatsProps));
    const data = processData(key, response, interval);
    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
