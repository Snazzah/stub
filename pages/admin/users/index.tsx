import type { User } from '@prisma/client';
import AppLayout from 'components/layout/app';
import { GetServerSideProps } from 'next';
import useSWR from 'swr';

import UserCard from '@/components/app/admin/user-card';
import UserCardPlaceholder from '@/components/app/placeholders/user-card-placeholder';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import { getSession } from '@/lib/auth';
import { fetcher } from '@/lib/utils';

export default function AdminUsers() {
  const { data: { users } = {} } = useSWR<{ users: User[] }>('/api/admin/users', fetcher);

  return (
    <AppLayout pageTitle="Users">
      <MaxWidthWrapper>
        <div className="my-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {users ? users.map((u) => <UserCard user={u} />) : Array.from({ length: 6 }).map((_, i) => <UserCardPlaceholder key={i} />)}
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
