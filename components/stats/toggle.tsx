import { useRouter } from 'next/router';

import BadgeSelect from '@/components/shared/badge-select';
import { ExpandingArrow } from '@/components/shared/icons';
import { INTERVALS } from '@/lib/constants';
import useScroll from '@/lib/hooks/use-scroll';
import { IntervalProps } from '@/lib/stats';
import { linkConstructor } from '@/lib/utils';

export default function Toggle({
  domain,
  linkKey,
  slug,
  interval,
  atModalTop
}: {
  domain: string;
  linkKey: string;
  slug: string;
  interval?: string;
  atModalTop?: boolean;
}) {
  const router = useRouter();

  const currentInterval = (interval as IntervalProps) || '24h';

  const atTop = useScroll(80) || atModalTop;
  return (
    <div className={`z-20 mb-5 top-[6.5rem] sticky p-5 -mx-2.5 lg:mx-0 bg-gray-50 ${atTop ? 'shadow-md' : ''}`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
        <a
          className="group flex text-xl text-gray-800 font-semibold"
          href={linkConstructor({ key: linkKey, domain })}
          target="_blank"
          rel="noreferrer"
        >
          {linkConstructor({ key: linkKey, domain, pretty: true })}
          <ExpandingArrow className="w-5 h-5" />
        </a>
        <div className="px-3 py-1 rounded-md shadow-md border bg-white border-gray-100">
          <BadgeSelect
            options={INTERVALS}
            selected={currentInterval}
            // @ts-ignore
            selectAction={(interval) => {
              router.push(
                {
                  query: {
                    ...router.query,
                    interval
                  }
                },
                `/p/${slug}/link/${encodeURIComponent(linkKey)}?interval=${interval}`,
                { shallow: true }
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
