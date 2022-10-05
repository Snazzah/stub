import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import BlurImage from '@/components/shared/blur-image';
import CopyButton from '@/components/shared/copy-button';
import { Chart, LoadingDots } from '@/components/shared/icons';
import useProject from '@/lib/swr/use-project';
import { LinkProps } from '@/lib/types';
import { fetcher, linkConstructor, nFormatter, timeAgo } from '@/lib/utils';

import Tooltip from '../shared/tooltip';
import { useAddEditLinkModal } from './modals/add-edit-link-modal';
import { useDeleteLinkModal } from './modals/delete-link-modal';

export default function LinkCard({ props }: { props: LinkProps }) {
  const { key, url, title, timestamp } = props;

  const urlHostname = url ? new URL(url).hostname : '';

  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { project, user } = useProject();
  const { domain } = project || {};
  const { data: session } = useSession();

  const { data: clicks, isValidating } = useSWR<string>(`/api/projects/${slug}/links/${encodeURIComponent(key)}/clicks`, fetcher);

  const { setShowAddEditLinkModal, AddEditLinkModal } = useAddEditLinkModal({
    props
  });

  const { setShowDeleteLinkModal, DeleteLinkModal } = useDeleteLinkModal({
    props
  });

  // Prevent hydration errors, and use local times
  const [dateTooltip, setDateTooltip] = useState('Loading...');
  useEffect(() => {
    setDateTooltip(new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(timestamp)));
  }, [timestamp]);

  return (
    <>
      <AddEditLinkModal />
      <DeleteLinkModal />
      <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-5 sm:space-y-0 border border-gray-200 bg-white p-4 rounded-md transition-all">
        <div className="relative flex items-center space-x-4">
          <BlurImage
            src={`https://logo.clearbit.com/${urlHostname}`}
            alt={urlHostname}
            className="w-10 h-10 rounded-full border border-gray-200"
            width={40}
            height={40}
          />
          <div>
            <div className="flex items-center space-x-2 max-w-fit">
              <a
                className="text-blue-800 text-sm sm:text-base font-semibold truncate w-40 sm:w-full"
                href={linkConstructor({ key, domain })}
                target="_blank"
                rel="noreferrer"
              >
                {linkConstructor({ key, domain, pretty: true })}
              </a>
              <CopyButton url={linkConstructor({ key, domain })} />
              <Link href={`${router.asPath}/link/${encodeURIComponent(key)}`}>
                <a className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-0.5 hover:scale-105 active:scale-95 transition-all duration-75">
                  <Chart className="w-4 h-4" />
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {isValidating || !clicks ? <LoadingDots color="#71717A" /> : nFormatter(parseInt(clicks))} clicks
                  </p>
                </a>
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-700 line-clamp-1">{title}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Tooltip content={dateTooltip}>
            <time className="text-sm hidden sm:block text-gray-500" dateTime={new Date(timestamp).toISOString()}>
              Added {timeAgo(timestamp)}
            </time>
          </Tooltip>
          {(session?.user?.superadmin || ['member', 'manager', 'owner'].includes(user?.role)) && (
            <>
              <button
                onClick={() => setShowAddEditLinkModal(true)}
                className="grow sm:grow-0 font-medium text-sm text-gray-500 px-5 py-1.5 sm:py-2 border rounded-md border-gray-200 hover:border-black active:scale-95 transition-all duration-75"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteLinkModal(true)}
                className="grow sm:grow-0 font-medium text-sm text-white bg-red-600 hover:bg-white hover:text-red-600 border-red-600 px-5 py-1.5 sm:py-2 border rounded-md active:scale-95 transition-all duration-75"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </li>
    </>
  );
}
