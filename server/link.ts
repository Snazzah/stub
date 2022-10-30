import cookie from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';

import { hasPasswordCookie, passwordValid, validPasswordCookie } from './decrypt';
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
  const { hostname, key: linkKey, query } = parseUrl(req);

  const key = linkKey || ':index';
  if (!hostname) return false;

  // Get the IP
  let ip = req.socket.remoteAddress ?? '127.0.0.1';
  if (process.env.TRUST_PROXY === 'true') {
    const proxyHeader = process.env.TRUST_PROXY_HEADER || 'cf-connecting-ip';
    if (proxyHeader && req.headers[proxyHeader])
      ip = Array.isArray(req.headers[proxyHeader]) ? req.headers[proxyHeader][0] : (req.headers[proxyHeader] as string);
  }

  const response = await redis.get(`${hostname}:${key}`).then((r) => {
    if (r !== null)
      return JSON.parse(r) as {
        url: string;
        password?: boolean;
        proxy?: boolean;
      };
    return null;
  });
  const target = response?.url;

  if (target) {
    const isBot = detectBot(req);
    if (response.password) {
      if (await validPasswordCookie(req, hostname, key)) serverRedirect(res, target);
      else if (query.password !== '' && typeof query.password === 'string' && (await passwordValid(hostname, key, query.password))) {
        res.setHeader(
          'Set-Cookie',
          cookie.serialize('stub_link_password', query.password, {
            path: `/${encodeURIComponent(key)}`,
            expires: new Date(Date.now() + 604800000)
          })
        );
        serverRedirect(res, target);
      } else {
        res.statusCode = 200;
        if (hasPasswordCookie(req))
          res.setHeader(
            'Set-Cookie',
            cookie.serialize('stub_link_password', '', {
              path: `/${encodeURIComponent(key)}`,
              expires: new Date(1)
            })
          );
        res.end(getPasswordPageHTML(typeof query.password === 'string' ? query.password : undefined));
      }
    } else if (response.proxy && isBot) {
      res.statusCode = 200;
      res.end(await getEmbedHTML(res, hostname, key));
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
