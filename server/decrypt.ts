import { parse } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import { z } from 'zod';

import { parseJSON, ParserError } from './bodyParser';
import { prisma } from './prisma';

const schema = z
  .object({
    domain: z.string().min(1),
    key: z.string().min(1),
    password: z.string().min(1)
  })
  .strict();

export async function decryptPassword(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const body = await parseJSON(req, 10000);
    const data = schema.safeParse(body);
    if (data.success === false) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Schema validation error', data: data.error.format() }));
      return;
    }
    const { domain, key, password } = body;
    const { url, password: realPassword } = await prisma.link.findUnique({
      where: { domain_key: { domain, key } },
      select: { url: true, password: true }
    });
    const validPassword = password === realPassword;
    if (validPassword) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ url }));
    } else {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Invalid password' }));
    }
  } catch (e) {
    if (e instanceof ParserError) {
      res.setHeader('Connection', 'close');
      res.statusCode = e.status;
      res.end(JSON.stringify({ error: e.message }));
      return;
    }

    res.statusCode = 400;
    res.end(JSON.stringify({ error: e.message }));
  }
}

export async function validPasswordCookie(req: IncomingMessage, domain: string, key: string) {
  try {
    if (!req.headers.cookie) return false;
    const cookies = parse(req.headers.cookie);
    if (!cookies.stub_link_password) return false;
    const passwordBuffer = Buffer.from(cookies.stub_link_password, 'base64');
    const password = passwordBuffer.toString('utf8');
    const { url, password: realPassword } = await prisma.link.findUnique({
      where: { domain_key: { domain, key } },
      select: { url: true, password: true }
    });
    if (!url) return false;
    return realPassword === password;
  } catch (e) {
    return false;
  }
}
