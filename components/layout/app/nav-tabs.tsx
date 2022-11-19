import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useMemo } from 'react';

const TabsHelper = (router: NextRouter): { name: string; href: string }[] => {
  const { slug, key, id } = router.query as {
    slug?: string;
    key?: string;
    id?: string;
  };
  if (key) return [{ name: '← All Links', href: `/p/${slug}` }];
  else if (slug)
    return [
      { name: 'Links', href: `/p/${slug}` },
      { name: 'Settings', href: `/p/${slug}/settings` }
    ];
  else if (router.pathname.startsWith('/admin/users/') && id)
    return [
      { name: '← Users', href: `/admin/users` },
      { name: 'Profile', href: `/admin/users/${id}` }
    ];
  else if (router.pathname.startsWith('/admin'))
    return [
      { name: '← Projects', href: `/` },
      { name: 'Instance Settings', href: `/admin` },
      { name: 'Users', href: `/admin/users` }
    ];
  return [{ name: 'Projects', href: `/` }];
};

export default function NavTabs() {
  const router = useRouter();
  const tabs = useMemo(() => {
    if (!router.isReady) {
      return [];
    } else {
      return TabsHelper(router);
    }
  }, [router.query]);

  return (
    <div className="flex justify-start space-x-2 items-center h-12 -mb-0.5">
      {tabs.map(({ name, href }) => (
        <Link key={href} href={href}>
          <a
            className={`border-b-2 p-1 ${
              // hacky approach to getting the current tab – will replace with useSelectedLayoutSegments when upgrading to Next.js 13
              router.asPath.split('?')[0].split('/').slice(0, 3).join('/') === href
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <div className="rounded-md px-3 py-2 hover:bg-gray-100 active:bg-gray-200 transition-all duration-75">
              <p className="text-sm">{name}</p>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}
