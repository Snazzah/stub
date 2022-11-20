import { getSession, withUserAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default withUserAuth(
  async (req, res) => {
    const session = await getSession(req, res);
    if (!session?.user.id || !session?.user?.superadmin) return res.status(401).send({ error: 'Unauthorized' });

    // GET /api/admin/users
    if (req.method === 'GET') {
      const users = await prisma.user.findMany();
      return res.status(200).json({
        users
      });
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  },
  { needSuperadmin: true }
);
