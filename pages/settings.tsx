import AppLayout from '@/components/layout/app';
import { serverSidePropsAuth } from '@/lib/auth';

export default function Settings() {
  return (
    <AppLayout pageTitle="Settings">
      <h1>Settings</h1>
    </AppLayout>
  );
}

export const getServerSideProps = serverSidePropsAuth;
