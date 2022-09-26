import AppLayout from 'components/layout/app';
import { GetServerSideProps } from 'next';
import useSWR from 'swr';

import AdminInformation from '@/components/app/admin/information';
import AdminRegister from '@/components/app/admin/register';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import { getSession } from '@/lib/auth';
import { AppSettingsProps } from '@/lib/types';
import { availableProviders, fetcher } from '@/lib/utils';

export default function Admin({ appVersion, providers }: { appVersion: string; providers: string[] }) {
  const { data } = useSWR<AppSettingsProps>('/api/app-settings', fetcher);

  return (
    <AppLayout pageTitle="App Settings">
      <MaxWidthWrapper>
        {data && (
          <div className="py-10 grid gap-5">
            <AdminRegister appSettings={data} providers={providers} />
            <AdminInformation appVersion={appVersion} appId={data.appId} />
          </div>
        )}
      </MaxWidthWrapper>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async function ({ req, res }) {
  const session = await getSession(req, res);
  if (!session?.user?.superadmin) return { redirect: { destination: '/' }, props: {} };
  return { props: { appVersion: process.env.npm_package_version, providers: availableProviders } };
};
