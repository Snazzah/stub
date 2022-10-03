import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id || !session?.user?.superadmin) return res.status(401).send({ error: 'Unauthorized' });

  // GET /api/admin/users/[id]
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing or misconfigured user id' });

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const session = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ user, lastLogin: session?.createdAt });
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
