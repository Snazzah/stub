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
    <div className="flex justify-start space-x-8 items-center h-12 -mb-0.5">
      {tabs.map(({ name, href }) => (
        <Link key={href} href={href}>
          <a
            className={`px-1 py-3 border-b-2 ${
              router.asPath === href ? 'border-black font-semibold' : 'border-transparent text-gray-700 hover:text-black'
            } transition-all`}
          >
            <p className="text-sm active:scale-95 transition-all duration-75">{name}</p>
          </a>
        </Link>
      ))}
    </div>
  );
}
