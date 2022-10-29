import './env';

import { createServer } from 'node:http';

import { decryptPassword } from './decrypt';
import { openReader } from './geoip';
import handleLink from './link';
import { prisma } from './prisma';

const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.ROUTER_PORT, 10) || 3001;

(async () => {
  await prisma.$connect();
  await openReader();
  const server = createServer(async (req, res) => {
    try {
      if (req.method === 'HEAD' && req.url === '/_stub' && req.headers['x-stub-matches-app'] === process.env.APP_HOSTNAME) {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'POST' && req.url === '/_stub/decrypt') return await decryptPassword(req, res);

      const handled = await handleLink(req, res);
      if (!handled) {
        res.statusCode = 422;
        res.end("No domain was provided, so we don't know what to do here.");
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.listen(
    {
      host: hostname,
      port
    },
    () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    }
  );
})();
