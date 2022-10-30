import Redis, { RedisOptions } from 'ioredis';
import { customAlphabet } from 'nanoid';

import { LinkProps } from '@/lib/types';
import { getMetadataFromUrl } from '@/lib/utils';

// Initiate Redis instance
export let redis: Redis;

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  keyPrefix: process.env.REDIS_PREFIX ?? '',
  password: process.env.REDIS_PASSWORD
};

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    redis = new Redis(redisOptions);
  } else {
    if (!(global as any).redis) (global as any).redis = new Redis(redisOptions);
    redis = (global as any).redis;
  }
}

/**
 * Everything to do with keys:
 * - Set a defined key
 * - Set a random key
 * - Generate a random key
 * - Check if key exists
 **/

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7); // 7-character random string

export async function setKey(hostname: string, key: string, url: string, props: Partial<Omit<LinkProps, 'key'>> = {}) {
  const metadata = !props.title ? await getMetadataFromUrl(url) : ({} as Record<string, string>);
  return await redis.hsetnx(
    `${hostname}:links`,
    key,
    JSON.stringify({
      url,
      title: metadata.title ?? url,
      description: metadata.description,
      timestamp: Date.now(),
      ...props
    } as Omit<LinkProps, 'key'>)
  );
}

export async function setRandomKey(
  hostname: string,
  url: string,
  props: Partial<Omit<LinkProps, 'key'>> = {}
): Promise<{ response: number; key: string }> {
  /* recursively set link till successful */
  const key = nanoid();
  const response = await setKey(hostname, key, url, props); // add to hash
  if (response === 0) {
    // by the off chance that key already exists
    return setRandomKey(hostname, url, props);
  } else {
    return { response, key };
  }
}

export async function getRandomKey(hostname: string): Promise<string> {
  /* recursively get random key till it gets one that's avaialble */
  const key = nanoid();
  const response = await redis.hexists(`${hostname}:links`, key); // check if key exists
  if (response === 1) {
    // by the off chance that key already exists
    return getRandomKey(hostname);
  } else {
    return key;
  }
}

export async function checkIfKeyExists(hostname: string, key: string) {
  return await redis.hexists(`${hostname}:links`, key);
}

/**
 * Get the links associated with a project
 **/
export async function getLinksForProject(slug: string): Promise<LinkProps[]> {
  /* This function is used to get all links for a project. */
  const keys = await redis.zrange(`${slug}:links:timestamps`, 0, -1, 'REV');
  if (!keys || keys.length === 0) return []; // no links for this project
  const linkObjects = await redis.hmget(`${slug}:links`, ...keys).then((r) => r.map((l) => JSON.parse(l)));
  const links = linkObjects.map((l, i) => ({ key: keys[i], ...l }));
  return links;
}

/**
 * Get the number of links that a project has
 **/
export async function getLinkCountForProject(slug: string) {
  return await redis.zcard(`${slug}:links:timestamps`);
}

export async function getLinkClicksCount(hostname: string, key: string) {
  return (await redis.zcard(`${hostname}:clicks:${key}`)) || 0;
}

export async function addLink(
  hostname: string,
  url: string,
  key?: string, // if key is provided, it will be used
  props: Partial<Omit<LinkProps, 'key'>> = {}
) {
  const response = key ? await setKey(hostname, key, url, props) : await setRandomKey(hostname, url, props);

  if (response === 1) {
    return await redis.zadd(`${hostname}:links:timestamps`, Date.now(), key);
  } else {
    return null; // key already exists
  }
}

export async function changeDomain(hostname: string, newHostname: string) {
  const keys = await redis.zrange(`${hostname}:links:timestamps`, 0, -1);
  const pipeline = redis.pipeline();
  pipeline.rename(`${hostname}:links`, `${newHostname}:links`);
  pipeline.rename(`${hostname}:links:timestamps`, `${newHostname}:links:timestamps`);
  pipeline.rename(`${hostname}:root:clicks`, `${newHostname}:root:clicks`);
  keys.forEach((key) => {
    pipeline.rename(`${hostname}:clicks:${key}`, `${newHostname}:clicks:${key}`);
  });
  try {
    return await pipeline.exec();
  } catch (e) {
    return null;
  }
}

export async function deleteProject(domain: string) {
  const keys = await redis.zrange(`${domain}:links:timestamps`, 0, -1);
  const pipeline = redis.pipeline();
  pipeline.del(`${domain}:links`);
  pipeline.del(`${domain}:links:timestamps`);
  pipeline.del(`${domain}:root:clicks`);
  keys.forEach((key) => {
    pipeline.del(`${domain}:clicks:${key}`);
  });
  try {
    return await pipeline.exec();
  } catch (e) {
    return null;
  }
}
