import ErrorPage from 'next/error';

import AppLayout from '@/components/layout/app';
import Stats from '@/components/stats';
import { serverSidePropsAuth } from '@/lib/auth';
import useProject from '@/lib/swr/use-project';

export default function StatsPage() {
  const { project, error } = useProject();

  // handle error page
  if (error && error.status === 404) return <ErrorPage statusCode={404} />;

  return <AppLayout pageTitle="Link Stats">{project && <Stats domain={project.domain} />}</AppLayout>;
}

export const getServerSideProps = serverSidePropsAuth;
