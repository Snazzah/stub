import NodeCache from 'node-cache';

import prisma from './prisma';

let cache: NodeCache;

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    cache = new NodeCache();
  } else {
    if (!(global as any).cache) (global as any).cache = new NodeCache({});
    cache = (global as any).cache;
  }
}

export const setCache = cache.set;

export async function fetchFromCache<T = any>(key: NodeCache.Key, ttl: string | number, fn: () => Promise<T>, cacheOnNull = false): Promise<T> {
  if (!cache) return await fn();
  if (cache.has(key)) return cache.get<T>(key);
  const value = await fn();
  if (value !== null || cacheOnNull) cache.set(key, value, ttl);
  return value;
}

export async function getUser(id: string) {
  return fetchFromCache(`user:${id}`, 60, async () => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return user;
  });
}

export { cache };
