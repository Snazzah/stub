import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { LinkProps } from '@/lib/types';
import { getParamsFromURL, nanoid } from '@/lib/utils';

const getFiltersFromStatus = (status: string) => {
  if (status === 'all' || status === 'none') {
    return {
      archived: undefined,
      expiresAt: undefined
    };
  }
  const selectedStatus = status.split(',');
  const activeSelected = selectedStatus.includes('active');
  const expiredSelected = selectedStatus.includes('expired');
  const archivedSelected = selectedStatus.includes('archived');
  return {
    AND: [
      {
        // archived can be either true or false
        archived: archivedSelected && selectedStatus.length === 1 ? true : !archivedSelected ? false : undefined
      },
      {
        OR: [
          {
            /* expiresAt can be either:
              - null
              - a date that's in the past 
              - a date that's in the future
            */
            expiresAt: expiredSelected && !activeSelected ? { lt: new Date() } : activeSelected && !expiredSelected ? { gte: new Date() } : undefined
          },
          {
            expiresAt: activeSelected && !expiredSelected ? null : undefined
          },
          {
            archived: archivedSelected && !activeSelected ? true : undefined
          }
        ]
      }
    ]
  };
};

export async function getLinksForProject({
  domain,
  status = 'active',
  sort = 'createdAt',
  userId
}: {
  domain: string;
  status?: string;
  sort?: 'createdAt' | 'clicks'; // always descending for both
  userId?: string;
}): Promise<LinkProps[]> {
  const filters = getFiltersFromStatus(status);
  return await prisma.link.findMany({
    where: {
      domain,
      ...filters,
      ...(userId && { userId })
    },
    orderBy: {
      [sort]: 'desc'
    },
    take: 100
  });
}

export async function getLinkCountForProject(domain: string) {
  return await prisma.link.count({
    where: {
      domain,
      archived: false
    }
  });
}

export async function getRandomKey(domain: string): Promise<string> {
  /* recursively get random key till it gets one that's avaialble */
  const key = nanoid();
  const response = await prisma.link.findUnique({
    where: {
      domain_key: {
        domain,
        key
      }
    }
  });
  if (response) {
    // by the off chance that key already exists
    return getRandomKey(domain);
  } else {
    return key;
  }
}

export async function checkIfKeyExists(domain: string, key: string) {
  const link = await prisma.link.findUnique({
    where: {
      domain_key: {
        domain,
        key
      }
    }
  });
  return !!link;
}

export async function addLink(link: LinkProps) {
  const { domain, key, url, expiresAt, password, title, description, image } = link;
  const hasPassword = password && password.length > 0 ? true : false;
  const proxy = title && description && image ? true : false;
  const exat = expiresAt ? new Date(expiresAt).getTime() / 1000 : null;

  const exists = await checkIfKeyExists(domain, key);
  if (exists) return null;

  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = getParamsFromURL(url);

  const [response] = await Promise.all([
    prisma.link.create({
      data: {
        ...link,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      }
    }),
    redis.set(
      `${domain}:${key}`,
      JSON.stringify({
        url,
        password: hasPassword,
        proxy
      }),
      ...(exat ? (['EXAT', exat] as ['EXAT', number]) : ([] as any[])),
      'NX'
    )
  ]);
  return response;
}

export async function editLink(link: LinkProps, oldKey: string) {
  const { id, domain, key, url, expiresAt, password, title, description, image } = link;
  const hasPassword = password && password.length > 0 ? true : false;
  const proxy = title && description && image ? true : false;
  const exat = expiresAt ? new Date(expiresAt).getTime() : null;
  const changedKey = key !== oldKey;

  if (changedKey) {
    const exists = await checkIfKeyExists(domain, key);
    if (exists) return null;
  }
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = getParamsFromURL(url);

  const [response] = await Promise.all([
    prisma.link.update({
      where: {
        id
      },
      data: {
        ...link,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      }
    }),
    redis.set(
      `${domain}:${key}`,
      JSON.stringify({
        url,
        password: hasPassword,
        proxy
      }),
      ...(exat ? (['EXAT', exat] as ['EXAT', number]) : ([] as any[]))
    )
  ]);

  return response;
}

export async function deleteLink(domain: string, key: string) {
  return await Promise.all([
    prisma.link.delete({
      where: {
        domain_key: {
          domain,
          key
        }
      }
    }),
    redis.del(`${domain}:${key}`),
    redis.del(`${domain}:clicks:${key}`)
  ]);
}

export async function archiveLink(domain: string, key: string, archived = true) {
  return await prisma.link.update({
    where: {
      domain_key: {
        domain,
        key
      }
    },
    data: {
      archived
    }
  });
}

export async function changeDomain(project: { id: string; domain: string }, newDomain: string) {
  const links = await prisma.link.findMany({
    where: {
      project: {
        id: project.id
      }
    }
  });
  const pipeline = redis.pipeline();
  links.forEach(({ key }) => {
    pipeline.rename(`${project.domain}:clicks:${key}`, `${newDomain}:clicks:${key}`);
  });
  try {
    return await pipeline.exec();
  } catch (e) {
    return null;
  }
}
