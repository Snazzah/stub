import { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';

import type { LinkProps } from '@/lib/types';

import { validPasswordCookie } from './decrypt';
import { getGeo } from './geoip';
import { getEmbedHTML, getPasswordPageHTML } from './html';
import { userAgentFromString } from './ua';
import { detectBot, parseUrl, serverRedirect } from './util';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  keyPrefix: process.env.REDIS_PREFIX ?? '',
  password: process.env.REDIS_PASSWORD
});

/** Recording clicks with geo, ua, referer and timestamp data **/
export async function recordClick(hostname: string, req: IncomingMessage, ip: string, key: string) {
  const now = Date.now();
  return await redis.zadd(
    `${hostname}:clicks:${key}`,
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

export default async function handleLink(req: IncomingMessage, res: ServerResponse) {
  const { hostname, key: linkKey } = parseUrl(req);

  const key = linkKey || ':index';
  if (!hostname) return false;

  // Get the IP
  let ip = req.socket.remoteAddress ?? '127.0.0.1';
  if (process.env.TRUST_PROXY === 'true') {
    const proxyHeader = process.env.TRUST_PROXY_HEADER || 'cf-connecting-ip';
    if (proxyHeader && req.headers[proxyHeader])
      ip = Array.isArray(req.headers[proxyHeader]) ? req.headers[proxyHeader][0] : (req.headers[proxyHeader] as string);
  }

  const response = await redis.hget(`${hostname}:links`, key).then((r) => {
    if (r !== null) return JSON.parse(r) as Omit<LinkProps, 'key'>;
    return null;
  });
  const target = response?.url;

  if (target) {
    const isBot = detectBot(req);
    if (response.password) {
      if (await validPasswordCookie(req, hostname, key)) serverRedirect(res, target);
      else {
        res.statusCode = 200;
        res.end(getPasswordPageHTML(key, hostname));
      }
    } else if (response.title && response.image && response.description && isBot) {
      res.statusCode = 200;
      res.end(getEmbedHTML(response));
    } else {
      serverRedirect(res, target);
    }
    await recordClick(hostname, req, ip, key);
  } else {
    // TODO allow for 404 links
    res.statusCode = 404;
    res.end('Not Found');
  }
  return true;
}
