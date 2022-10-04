import type { User } from '@prisma/client';
import AppLayout from 'components/layout/app';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { LoadingDots } from '@/components/shared/icons';
import SuperAdmin from '@/components/shared/icons/superadmin';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import Tooltip from '@/components/shared/tooltip';
import { getSession } from '@/lib/auth';
import { fetcher, flattenErrors, timeAgo } from '@/lib/utils';

function EditProfile({ user }: { user: User }) {
  const [data, setData] = useState<{ name: string; email: string; superadmin: boolean; image: string | null }>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    image: user?.image ?? null,
    superadmin: user?.superadmin ?? false
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const dataChanged = useMemo(() => {
    return user.name !== data.name || user.email !== data.email || user.superadmin !== data.superadmin || user.image !== data.image;
  }, [data, user]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => null);

    if (!response) {
      setError({ message: 'Unexpected request error' });
      setSaving(false);
      return;
    }

    const body = await response.json().catch(() => null);
    if (!body) {
      setError({ message: 'Unexpected body parsing error' });
      setSaving(false);
      return;
    }

    if (response.status !== 200) setError(body);
    else mutate(`/api/admin/users/${user.id}`);
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-bold">Edit Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">ID</label>
        <span className="flex mt-1 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-500 px-3 py-2 sm:text-sm whitespace-nowrap">
          {user.id}
        </span>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="flex mt-1 rounded-md shadow-sm">
          <input
            name="name"
            id="name"
            type="text"
            required
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder="User"
            value={data.name}
            onChange={(e) => {
              setData({ ...data, name: e.target.value });
            }}
            aria-invalid="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <div className="flex mt-1 rounded-md shadow-sm">
          <input
            name="email"
            id="email"
            type="text"
            required
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder="user@example.com"
            pattern={`(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))`}
            value={data.email}
            onChange={(e) => {
              setData({ ...data, email: e.target.value });
            }}
            aria-invalid="true"
          />
        </div>
        {error?.data?.email &&
          flattenErrors(error?.data?.email).map((line, i) => (
            <p key={i} className="text-red-700 text-sm">
              {line}
            </p>
          ))}
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Avatar URL
        </label>
        <div className="flex mt-1 rounded-md shadow-sm">
          <input
            name="image"
            id="image"
            type="url"
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder={`https://avatars.dicebear.com/api/micah/${user?.email}.svg`}
            value={data.image || ''}
            onChange={(e) => {
              setData({ ...data, image: e.target.value || null });
            }}
            aria-invalid="true"
          />
        </div>
        {error?.data?.image &&
          flattenErrors(error?.data?.image).map((line, i) => (
            <p key={i} className="text-red-700 text-sm">
              {line}
            </p>
          ))}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          save();
        }}
        disabled={saving || !dataChanged}
        className="bg-black text-white border-black hover:text-black hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:text-white disabled:border-transparent h-9 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150"
      >
        {saving ? <LoadingDots /> : 'Save'}
      </button>
    </div>
  );
}

export default function AdminUserProfile() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: { user, lastLogin } = {} } = useSWR<{ user: User; lastLogin: string }>(id && `/api/admin/users/${id}`, fetcher, {
    dedupingInterval: 30000
  });

  return (
    <AppLayout pageTitle={user ? user.name : 'User Profile'}>
      <MaxWidthWrapper>
        <div className="my-10 flex flex-col gap-10">
          {user && (
            <>
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
                    <Tooltip content="This user is a superadmin.">
                      <div className="flex-none">
                        <SuperAdmin className="w-6 h-6" />
                      </div>
                    </Tooltip>
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
              <EditProfile user={user} />
            </>
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
