import type { User } from '@prisma/client';
import AppLayout from 'components/layout/app';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import UserTypeRadioGroup from '@/components/app/admin/user-type-radiogroup';
import UserAdminPlaceholder from '@/components/app/placeholders/user-admin-placeholder';
import { Discord, Email, Facebook, Github, Google, LoadingDots, SuperAdmin, Twitter } from '@/components/shared/icons';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import Tooltip from '@/components/shared/tooltip';
import { getSession } from '@/lib/auth';
import { AdminUserProps } from '@/lib/types';
import { fetcher, timeAgo } from '@/lib/utils';

function EditProfile({ user }: { user: User }) {
  const [data, setData] = useState<{ name: string; email: string; type: string; superadmin: boolean; image: string | null }>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    image: user?.image ?? null,
    type: user?.type ?? '',
    superadmin: user?.superadmin ?? false
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const dataChanged = useMemo(() => {
    return (
      user.name !== data.name ||
      user.email !== data.email ||
      user.superadmin !== data.superadmin ||
      user.image !== data.image ||
      user.type !== data.type
    );
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
        {error?.data?.name?._errors && <p className="text-red-700 text-sm">{error.data.name._errors.join(', ')}</p>}
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
            maxLength={255}
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
        {error?.data?.email?._errors && <p className="text-red-700 text-sm">{error.data.email._errors.join(', ')}</p>}
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
            placeholder={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.email}`}
            value={data.image || ''}
            onChange={(e) => {
              setData({ ...data, image: e.target.value || null });
            }}
            aria-invalid="true"
          />
        </div>
        {error?.data?.image?._errors && <p className="text-red-700 text-sm">{error.data.image._errors.join(', ')}</p>}
      </div>

      <UserTypeRadioGroup value={data.type} onChange={(type) => setData({ ...data, type })} errors={error?.data?.type?._errors} />

      <div className="flex justify-center flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            id="superadmin"
            name="superadmin"
            type="checkbox"
            checked={data.superadmin}
            onChange={(e) => {
              setData({ ...data, superadmin: e.target.checked });
            }}
            className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:border-gray-500 focus:ring-gray-500 focus:outline-none"
          />
          <label htmlFor="superadmin" className="block text-sm font-medium text-gray-700">
            Superadmin status
          </label>
          {data.superadmin !== user.superadmin && <span className="text-sm text-red-500 font-bold font-display animate-pulse">!!!</span>}
        </div>
        <p className="text-gray-600 text-sm">
          Enabling this grants the user <b>all possible permissions</b>, including changing instance-wide settings. Enable this only for users you
          trust.
        </p>
        {error?.data?.superadmin?._errors && <p className="text-red-700 text-sm">{error.data.superadmin._errors.join(', ')}</p>}
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
  const { data: { user, accounts, lastLogin } = {} } = useSWR<AdminUserProps>(id && `/api/admin/users/${id}`, fetcher, {
    dedupingInterval: 30000
  });

  const providerIcons: Record<string, ReactNode> = {
    discord: <Discord className="w-10 h-10 text-gray-700" />,
    github: <Github className="w-10 h-10 text-gray-700" />,
    twitter: <Twitter className="w-10 h-10 text-gray-700" />,
    facebook: <Facebook className="w-10 h-10 text-gray-700" />,
    google: <Google className="w-10 h-10 text-gray-700" />,
    email: <Email className="w-10 h-10 text-gray-700" />
  };

  const providerTitles: Record<string, string> = {
    github: 'GitHub',
    email: 'E-mail'
  };

  return (
    <AppLayout pageTitle={user ? user.name : 'User Profile'}>
      <MaxWidthWrapper>
        <div className="my-10 flex flex-col gap-10">
          {!user ? (
            <UserAdminPlaceholder />
          ) : (
            <>
              <div className="flex gap-4 items-center md:flex-row flex-col">
                <img
                  src={user?.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.email}`}
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
                      <time dateTime={new Date(user.createdAt).toISOString()}>Joined {timeAgo(new Date(user.createdAt))}</time>
                    </Tooltip>
                    {lastLogin && (
                      <>
                        <span className="mx-2">·</span>
                        <Tooltip content={new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(lastLogin))}>
                          <time dateTime={new Date(lastLogin).toISOString()}>Last sign-in {timeAgo(new Date(lastLogin))}</time>
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

          {accounts && accounts.length && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-bold">Accounts</h2>

              {accounts.map((a) => (
                <div key={a.id} className="bg-white shadow rounded-lg py-3 px-4 flex gap-4 items-center">
                  {providerIcons[a.provider]}
                  <div className="flex justify-center flex-col">
                    <h3 className="text-lg font-medium text-gray-700 capitalize">{providerTitles[a.provider] ?? a.provider}</h3>
                    <span className="text-gray-500 text-sm">{a.providerAccountId}</span>
                  </div>
                </div>
              ))}
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
