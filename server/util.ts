import { IncomingMessage, ServerResponse } from 'node:http';
import { parse } from 'node:url';

export function parseUrl(req: IncomingMessage) {
  const hostname = req.headers['host'];
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const key = pathname.slice(1);
  return {
    hostname,
    path: pathname,
    key,
    query,
    parsedUrl
  };
}

export function serverRedirect(res: ServerResponse, location: string, status = 302) {
  res.setHeader('location', location);
  res.statusCode = status;
  res.end();
}

export const detectBot = (req: IncomingMessage) => {
  const ua = req.headers['user-agent'];
  if (ua) {
    // Note: MetaInspector is for https://metatags.io/
    return /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|MetaInspector/i.test(ua);
  }
  return false;
};
