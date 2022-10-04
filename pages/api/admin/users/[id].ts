import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

const schema = z
  .object({
    name: z.string().trim().min(1).max(256).optional(),
    email: z.string().trim().email().optional(),
    image: z.string().trim().url().nullable().optional(),
    superadmin: z.boolean().optional()
  })
  .strict();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id || !session?.user?.superadmin) return res.status(401).send({ error: 'Unauthorized' });
  const { id } = req.query;

  // GET /api/admin/users/[id]
  if (req.method === 'GET') {
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing or misconfigured user id' });

    const userInfo = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true
          }
        },
        sessions: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!userInfo) return res.status(404).json({ error: 'User not found' });

    const { sessions, accounts, ...user } = userInfo;

    return res.status(200).json({ user, accounts, lastLogin: sessions[0]?.createdAt });
  } else if (req.method === 'PUT') {
    // PUT /api/admin/users/[id]
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing or misconfigured user id' });

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const data = schema.safeParse(req.body);
    if (data.success === false) return res.status(400).send({ message: 'Schema validation error', data: data.error.format() });

    await prisma.user.update({
      where: { id: user.id },
      data: data.data
    });

    return res.status(200).json({ user });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
