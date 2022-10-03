import type { User } from '@prisma/client';
import AppLayout from 'components/layout/app';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import SuperAdmin from '@/components/shared/icons/superadmin';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import Tooltip from '@/components/shared/tooltip';
import { getSession } from '@/lib/auth';
import { fetcher, timeAgo } from '@/lib/utils';

export default function AdminUserProfile() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: { user, lastLogin } = {} } = useSWR<{ user: User; lastLogin: string }>(id && `/api/admin/users/${id}`, fetcher, {
    dedupingInterval: 30000
  });

  return (
    <AppLayout pageTitle={user ? user.name : 'User Profile'}>
      <MaxWidthWrapper>
        <div className="my-10 flex flex-col gap-5">
          {user && (
            <div className="flex gap-4 items-center md:flex-row flex-col">
              <img
                src={user?.image || `https://avatars.dicebear.com/api/micah/${user?.email}.svg`}
                alt={user.name}
                className="w-24 h-24 flex-none rounded-full overflow-hidden border border-gray-300"
                draggable={false}
              />
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-medium text-gray-700 flex items-center md:justify-start justify-center gap-2">
                  <span className="truncate">{user.name}</span>
                  <SuperAdmin className="w-6 h-6 flex-none" />
                </h1>
                <div className="text-sm text-gray-500 flex flex-wrap md:justify-start justify-center">
                  <Tooltip content={new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(user.createdAt))}>
                    <time dateTime={new Date(user.createdAt).toISOString()}>Joined {timeAgo(new Date(user.createdAt).valueOf())}</time>
                  </Tooltip>
                  {lastLogin && (
                    <>
                      <span className="mx-2">·</span>
                      <Tooltip content={new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(lastLogin))}>
                        <time dateTime={new Date(lastLogin).toISOString()}>Last sign-in {timeAgo(new Date(lastLogin).valueOf())}</time>
                      </Tooltip>
                    </>
                  )}
                  {user.email && (
                    <>
                      <span className="mx-2">·</span>
                      <a href={`mailto:${user.email}`} className="text-blue-500 hover:underline">
                        {user.email}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({ req, res }) {
  const session = await getSession(req, res);
  if (!session?.user?.superadmin) return { redirect: { destination: '/' }, props: {} };
  return { props: { session } };
};
