import { useRouter } from 'next/router';

import BadgeSelect from '@/components/shared/badge-select';
import { ExpandingArrow } from '@/components/shared/icons';
import { INTERVALS } from '@/lib/constants';
import useScroll from '@/lib/hooks/use-scroll';
import { IntervalProps } from '@/lib/stats';
import { linkConstructor } from '@/lib/utils';

import CopyButton from '../shared/copy-button';

export default function Toggle({
  domain,
  linkKey, // Still optional
  slug,
  interval,
  atModalTop
}: {
  domain: string;
  linkKey?: string; // linkKey is optional
  slug: string;
  interval?: string;
  atModalTop?: boolean;
}) {
  const router = useRouter();
  const currentInterval = (interval as IntervalProps) || '24h';
  const atTop = useScroll(80) || atModalTop;

  // Determine the base path for routing
  const basePath = linkKey ? `/p/${slug}/link/${encodeURIComponent(linkKey)}` : `/p/${slug}/analytics`;

  return (
    <div className={`z-20 mb-5 top-[6.5rem] sticky p-5 -mx-2.5 lg:mx-0 bg-gray-50 ${atTop ? 'shadow-md' : ''}`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
        {linkKey ? ( // Render link-specific UI if linkKey is present
          <div className="flex text-xl text-gray-800 font-semibold gap-2">
            <CopyButton url={linkConstructor({ key: linkKey, domain })} />
            <a className="group flex" href={linkConstructor({ key: linkKey, domain })} target="_blank" rel="noreferrer">
              {linkConstructor({ key: linkKey, domain, pretty: true })}
              <ExpandingArrow className="w-5 h-5" />
            </a>
          </div>
        ) : ( // Render project-specific UI if linkKey is not present
          <div className="flex text-xl text-gray-800 font-semibold gap-2">
            <span>{domain}</span> {/* Display the domain or other project-specific data */}
            {/* Possibly include other project-specific controls or info */}
          </div>
        )}
        <div className="px-3 py-1 rounded-md shadow-md border bg-white border-gray-100">
          <BadgeSelect
            options={INTERVALS}
            selected={currentInterval}
            selectAction={(newInterval) => {
              router.push(
                {
                  query: {
                    ...router.query,
                    interval: newInterval
                  }
                },
                `${basePath}?interval=${newInterval}`,
                { shallow: true }
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}