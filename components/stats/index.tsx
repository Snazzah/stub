import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import CursorIllustration from '@/components/shared/illustrations/cursor';
import Clicks from '@/components/stats/clicks';
import Devices from '@/components/stats/devices';
import Locations from '@/components/stats/locations';
import Referer from '@/components/stats/referer';
import Toggle from '@/components/stats/toggle';
import { dummyData, StatsProps } from '@/lib/stats';
import { fetcher } from '@/lib/utils';

export default function Stats({ atModalTop, domain }: { atModalTop?: boolean; domain: string }) {
  const router = useRouter();

  const { slug, key, interval } = router.query as {
    slug?: string;
    key?: string; // key might not be present for project stats
    interval?: string;
  };

  // Determine the endpoint based on the presence of the key
  const endpoint = key
    ? `/api/projects/${slug}/links/${encodeURIComponent(key)}/stats${interval ? `?interval=${interval}` : ''}`
    : `/api/projects/${slug}/stats${interval ? `?interval=${interval}` : ''}`;

  const { data, error, isValidating } = useSWR<StatsProps>(
    router.isReady && endpoint,
    fetcher,
    {
      keepPreviousData: true,
      fallbackData: dummyData
    }
  );

  // Handle error or no data state
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-10">
        <CursorIllustration className="w-36 h-36 text-amber-500/50" />
        <h1 className="text-xl sm:text-2xl text-gray-600">Something went wrong...</h1>
        <Link href="/">
          <a className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2">
            Back to home
          </a>
        </Link>
      </div>
    );
  }

  // Render stats components
  return (
    <div className="bg-gray-50 pb-20 mx-auto lg:px-0 px-2.5">
      <Toggle domain={domain} linkKey={key} interval={interval} slug={slug} atModalTop={atModalTop} />
      <div className="max-w-4xl mx-auto grid gap-5">
        <Clicks data={data} isValidating={isValidating} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Locations data={data} />
          <Devices data={data} />
          <Referer data={data} />
        </div>
      </div>
    </div>
  );
}