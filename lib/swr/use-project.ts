import { useRouter } from 'next/router';
import { useMemo } from 'react';
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

  const isOwner = useMemo(() => {
    if (data?.user) return data.user.role === 'owner';
  }, [data]);

  return {
    project: data?.project,
    user: data?.user,
    isOwner,
    loading: !error && !data,
    error
  };
}
