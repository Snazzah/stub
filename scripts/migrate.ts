import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  keyPrefix: process.env.REDIS_PREFIX ?? '',
  password: process.env.REDIS_PASSWORD
});

interface V0_3LinkProps {
  key: string;
  url: string;
  title: string;
  timestamp?: number;
  description?: string;
  image?: string;
}

(async () => {
  const projects = await prisma.project.findMany({
    include: {
      users: {
        where: {
          role: 'owner'
        }
      }
    }
  });

  // convert v0.3 links to v0.4
  for (const project of projects) {
    const oldLinks = await redis.hkeys(`${project.domain}:links`);
    for (const key of oldLinks) {
      const link: V0_3LinkProps = JSON.parse(await redis.hget(`${project.domain}:links`, key));
      const existingLink = await prisma.link.findFirst({
        where: {
          domain: project.domain,
          key
        }
      });
      await Promise.all([
        !existingLink &&
          prisma.link.create({
            data: {
              domain: project.domain,
              key,
              url: link.url,
              title: link.title,
              description: link.description,
              image: link.image,
              createdAt: link.timestamp ? new Date(link.timestamp) : new Date(),
              userId: project.users[0].id
            }
          }),
        redis.set(
          `${project.domain}:${key}`,
          JSON.stringify({
            url: link.url,
            proxy: link.title && link.description && !!link.image,
            password: false
          }),
          'NX'
        ),
        redis.hdel(`${project.domain}:links`, key)
      ]);
    }
  }

  console.log('Applied migrations.');
  redis.disconnect();
  await prisma.$disconnect();
})();
