import { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';

import type { LinkProps } from '@/lib/types';

import { getGeo } from './geoip';
import { userAgentFromString } from './ua';
import { parseUrl, serverRedirect } from './util';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  keyPrefix: process.env.REDIS_PREFIX ?? '',
  password: process.env.REDIS_PASSWORD
});

/**
 * Recording clicks with geo, ua, referer and timestamp data
 * If key is not specified, record click as the root click
 **/
export async function recordClick(hostname: string, req: IncomingMessage, ip: string, key?: string) {
  const now = Date.now();
  return await redis.zadd(
    key ? `${hostname}:clicks:${key}` : `${hostname}:root:clicks`,
    'NX',
    now,
    JSON.stringify({
      geo: getGeo(ip),
      ua: userAgentFromString(req.headers['user-agent']),
      referer: req.headers.referer,
      timestamp: now
    })
  );
}

interface Cooldown {
  uses: number;
  expires: number;
}

interface CooldownResponse {
  ok: boolean;
  cooldown: Cooldown;
  expiry: number;
}

export async function processCooldown(key: string, ms: number, uses: number): Promise<CooldownResponse> {
  const currentTime = Date.now();
  const cooldownString = await redis.get(key);
  const cooldown: Cooldown = cooldownString ? JSON.parse(cooldownString) : { uses, expires: currentTime + ms };
  const expiry = cooldown.expires - currentTime;
  if (cooldown.uses <= 0 && currentTime < cooldown.expires) return { ok: false, cooldown, expiry };
  cooldown.uses--;
  if (Math.round(expiry) > 0) await redis.set(key, JSON.stringify(cooldown), 'PX', Math.round(expiry));
  return { ok: true, cooldown, expiry };
}

const RATELIMIT_USES = 10;
const RATELIMIT_EXPIRY = 60000;

export default async function handleLink(req: IncomingMessage, res: ServerResponse) {
  const { hostname, key: linkKey } = parseUrl(req);

  const key = linkKey || ':index';
  if (!hostname) return false;

  // Get the IP
  let ip = req.socket.remoteAddress ?? '127.0.0.1';
  if (process.env.TRUST_PROXY === 'true') {
    const proxyHeader = process.env.TRUST_PROXY_HEADER ?? 'cf-connecting-ip';
    if (proxyHeader && req.headers[proxyHeader])
      ip = Array.isArray(req.headers[proxyHeader]) ? req.headers[proxyHeader][0] : (req.headers[proxyHeader] as string);
  }

  const cooldown = await processCooldown(`stub_${ip}`, RATELIMIT_EXPIRY, RATELIMIT_USES);

  if (cooldown.ok) {
    // if ratelimit is not exceeded
    const response = await redis.hget(`${hostname}:links`, key).then((r) => {
      if (r !== null) return JSON.parse(r) as Omit<LinkProps, 'key'>;
      return null;
    });
    const target = response?.url;

    if (target) {
      serverRedirect(res, target);
      await recordClick(hostname, req, ip, key);
    } else {
      // TODO allow for 404 links
      res.statusCode = 404;
      res.end('Not Found');
    }
  } else {
    res
      .setHeader('X-RateLimit-Limit', RATELIMIT_USES)
      .setHeader('X-RateLimit-Remaining', cooldown.cooldown.uses)
      .setHeader('X-RateLimit-Reset', Math.ceil(cooldown.cooldown.expires / 1000));
    res.statusCode = 429;
    res.end('You are requesting a bit too often, try again later.');
  }
  return true;
}
