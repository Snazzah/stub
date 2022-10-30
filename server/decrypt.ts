import { IncomingMessage } from 'node:http';

import { parse } from 'cookie';

import { prisma } from './prisma';

export async function validPasswordCookie(req: IncomingMessage, domain: string, key: string) {
  try {
    if (!req.headers.cookie) return false;
    const cookies = parse(req.headers.cookie);
    if (!cookies.stub_link_password) return false;
    return await passwordValid(domain, key, cookies.stub_link_password);
  } catch (e) {
    return false;
  }
}

export function hasPasswordCookie(req: IncomingMessage) {
  try {
    if (!req.headers.cookie) return false;
    const cookies = parse(req.headers.cookie);
    if (cookies.stub_link_password) return true;
  } catch (e) {
    return false;
  }
}

export async function passwordValid(domain: string, key: string, password: string) {
  try {
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
