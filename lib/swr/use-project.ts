import { useRouter } from 'next/router';
import useSWR from 'swr';

import { ProjectResponseProps } from '@/lib/types';
import { fetcher } from '@/lib/utils';

export default function useProject() {
  const router = useRouter();

  const { slug } = router.query as {
    slug: string;
  };

  const { data, error } = useSWR<ProjectResponseProps>(slug && `/api/projects/${slug}`, fetcher, {
    dedupingInterval: 30000
  });

  return {
    project: data?.project,
    user: data?.user,
    loading: !error && !data,
    error
  };
}
