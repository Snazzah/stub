import ms from 'ms';

import { ccTLDs, secondLevelDomains } from './constants';

interface SWRError extends Error {
  status: number;
}

export async function fetcher<JSON = any>(input: RequestInfo, init?: RequestInit): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as SWRError;
      error.status = res.status;
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  return res.json();
}

export function nFormatter(num: number, digits?: number) {
  if (!num) return '0';
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits || 1).replace(rx, '$1') + item.symbol : '0';
}

export function linkConstructor({ key, domain, pretty }: { key: string; domain: string; pretty?: boolean }) {
  const localhost = /^(?:[a-z0-9-]+\.)*localhost(?::\d{1,6})?$/.test(domain);
  const link = `http${!localhost ? 's' : ''}://${domain}${key === ':index' ? '' : `/${decodeURIComponent(key)}`}`;

  return pretty ? link.replace(/^https?:\/\//, '') : link;
}

export const getMetadataFromUrl = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // timeout if it takes longer than 2 seconds
  const title = await fetch(url, {
    headers: { 'User-Agent': `StubMetaInspector/${process.env.npm_package_version} (+https://github.com/Snazzah/stub)` },
    signal: controller.signal
  })
    .then((res) => {
      clearTimeout(timeoutId);
      return res.text();
    })
    .then((body: string) => {
      const result = {
        title: null,
        description: null
      };
      try {
        const match = body.match(/<title>([^<]*)<\/title>/); // regular expression to parse contents of the <title> tag
        if (match && typeof match[1] === 'string') result.title = match[1];
      } catch (e) {}
      try {
        const match = body.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/>/); // regular expression to parse contents of the description meta tag
        if (match && typeof match[1] === 'string') result.description = match[1];
      } catch (e) {}
      return result;
    })
    .catch((err) => {
      console.log(err);
      return {
        title: null,
        description: null
      };
    });
  return title;
};

export const timeAgo = (timestamp: number): string => {
  if (!timestamp) return 'never';
  return `${ms(Date.now() - timestamp)} ago`;
};

export const generateSlugFromName = (name: string) => {
  const normalizedName = name.toLowerCase().replaceAll(' ', '-');
  if (normalizedName.length < 3) {
    return '';
  }
  if (ccTLDs.has(normalizedName.slice(-2))) {
    return `${normalizedName.slice(0, -2)}.${normalizedName.slice(-2)}`;
  }
  // remove vowels
  const devowel = normalizedName.replace(/[aeiou]/g, '');
  if (devowel.length >= 3 && ccTLDs.has(devowel.slice(-2))) {
    return `${devowel.slice(0, -2)}.${devowel.slice(-2)}`;
  }

  const acronym = normalizedName
    .split('-')
    .map((word) => word[0])
    .join('');

  if (acronym.length >= 3 && ccTLDs.has(acronym.slice(-2))) {
    return `${acronym.slice(0, -2)}.${acronym.slice(-2)}`;
  }

  const shortestString = [normalizedName, devowel, acronym].reduce((a, b) => (a.length < b.length ? a : b));

  return `${shortestString}.sh`;
};

export const getApexDomain = (url: string) => {
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    return '';
  }
  const parts = domain.split('.');
  if (parts.length > 2) {
    // if this is a second-level TLD (e.g. co.uk, .com.ua, .org.tt), we need to return the last 3 parts
    if (secondLevelDomains.has(parts[parts.length - 2]) && ccTLDs.has(parts[parts.length - 1])) {
      return parts.slice(-3).join('.');
    }
    // otherwise, it's a subdomain (e.g. dub.vercel.app), so we return the last 2 parts
    return parts.slice(-2).join('.');
  }
  // if it's a normal domain (e.g. dub.sh), we return the domain
  return domain;
};

export const validDomainRegex = new RegExp('^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$');

const providerKeyMap: Record<string, string[]> = {
  email: ['EMAIL_SERVER', 'EMAIL_FROM'],
  discord: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'],
  github: ['GITHUB_ID', 'GITHUB_SECRET'],
  twitter: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
  facebook: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
};

export const availableProviders: string[] = Object.keys(providerKeyMap).filter(
  (k) => !providerKeyMap[k].map((e) => !!process.env[e]).includes(false)
);

export function flattenErrors(errors: any, keyPrefix = '') {
  let messages: string[] = [];
  for (const fieldName in errors) {
    if (!(fieldName in errors) || fieldName === 'message') continue;
    if (fieldName === '_errors') {
      messages = messages.concat(errors[fieldName].map((obj) => `${keyPrefix}: ${obj.message || obj}`));
    } else if (errors[fieldName]._errors) {
      messages = messages.concat(errors[fieldName]._errors.map((obj) => `${keyPrefix + fieldName}: ${obj.message || obj}`));
    } else if (Array.isArray(errors[fieldName])) {
      messages = messages.concat(errors[fieldName].map((str) => `${keyPrefix + fieldName}: ${str}`));
    } else if (typeof errors[fieldName] === 'object') {
      messages = messages.concat(this.flattenErrors(errors[fieldName], keyPrefix + fieldName + '.'));
    }
  }
  return messages;
}
