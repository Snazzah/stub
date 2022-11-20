import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { useAddEditLinkModal } from '@/components/app/modals/add-edit-link-modal';
import { useArchiveLinkModal } from '@/components/app/modals/archive-link-modal';
import { useDeleteLinkModal } from '@/components/app/modals/delete-link-modal';
import { useLinkQRModal } from '@/components/app/modals/link-qr-modal';
import BlurImage from '@/components/shared/blur-image';
import CopyButton from '@/components/shared/copy-button';
import IconMenu from '@/components/shared/icon-menu';
import { Archive, Chart, Delete, Edit, LoadingDots, QR, ThreeDots } from '@/components/shared/icons';
import Popover from '@/components/shared/popover';
import Tooltip from '@/components/shared/tooltip';
import useProject from '@/lib/swr/use-project';
import { LinkProps } from '@/lib/types';
import { fetcher, getApexDomain, getFaviconFromDomain, getQueryString, linkConstructor, nFormatter, timeAgo } from '@/lib/utils';

export default function LinkCard({ props }: { props: LinkProps }) {
  const { key, url, createdAt, archived, expiresAt } = props;

  const apexDomain = getApexDomain(url);

  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { project, user } = useProject();
  const { domain } = project || {};
  const { data: session } = useSession();

  const { data: clicks, isValidating } = useSWR<number>(`/api/projects/${slug}/links/${encodeURIComponent(key)}/clicks`, fetcher, {
    fallbackData: props.clicks
  });

  const { setShowLinkQRModal, LinkQRModal } = useLinkQRModal({
    props
  });
  const { setShowAddEditLinkModal, AddEditLinkModal } = useAddEditLinkModal({
    props
  });
  const { setShowArchiveLinkModal, ArchiveLinkModal } = useArchiveLinkModal({
    props
  });
  const { setShowDeleteLinkModal, DeleteLinkModal } = useDeleteLinkModal({
    props
  });
  const [openPopover, setOpenPopover] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  // Prevent hydration errors, and use local times
  const [dateTooltip, setDateTooltip] = useState('Loading...');
  useEffect(() => {
    setDateTooltip(new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' }).format(new Date(createdAt)));
  }, [createdAt]);

  const expired = expiresAt && new Date() > new Date(expiresAt);

  return (
    <div className="relative rounded-lg border border-gray-100 bg-white p-3 pr-1 shadow transition-all hover:shadow-md sm:p-4">
      <LinkQRModal />
      <AddEditLinkModal />
      <ArchiveLinkModal />
      <DeleteLinkModal />
      <div className="absolute top-0 left-0 rounded-l-lg overflow-hidden w-1.5 h-full flex flex-col">
        {archived && <div className="bg-gray-400 h-full w-full" />}
        {expired ? <div className="bg-amber-500 h-full w-full" /> : <div className="bg-green-500 h-full w-full" />}
      </div>
      <li className="relative flex justify-between items-center">
        <div className="relative flex items-center space-x-2 sm:space-x-4 shrink">
          <BlurImage
            src={getFaviconFromDomain(apexDomain)}
            alt={apexDomain}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
            width={20}
            height={20}
          />
          <div>
            <div className="flex items-center space-x-2 max-w-fit">
              <a
                className="text-blue-800 text-sm sm:text-base font-semibold truncate w-24 sm:w-full"
                href={linkConstructor({ key, domain })}
                target="_blank"
                rel="noreferrer"
              >
                <span className="hidden sm:block">{linkConstructor({ key, domain, pretty: true })}</span>
                <span className="sm:hidden">
                  {linkConstructor({
                    key,
                    domain,
                    pretty: true
                  })}
                </span>
              </a>
              <CopyButton url={linkConstructor({ key, domain })} />
              <button
                onClick={() => setShowLinkQRModal(true)}
                className="group p-1.5 rounded-full bg-gray-100 hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-75"
              >
                <span className="sr-only">Download QR</span>
                <QR className="text-gray-700 group-hover:text-blue-800 transition-all" />
              </button>
              <Link href={`/p/${slug}/link/${encodeURIComponent(key)}`}>
                <a className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-0.5 hover:scale-105 active:scale-95 transition-all duration-75">
                  <Chart className="w-4 h-4" />
                  <p className="text-sm text-gray-500 whitespace-nowrap">
                    {isValidating ? <LoadingDots color="#71717A" /> : nFormatter(clicks)}
                    <span className="hidden sm:inline-block ml-1">clicks</span>
                  </p>
                </a>
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-md lg:max-w-2xl xl:max-w-3xl">{url}</h3>
          </div>
        </div>

        <div className="flex items-center">
          <Tooltip content={dateTooltip}>
            <time className="text-sm text-gray-500" dateTime={new Date(createdAt).toISOString()}>
              <p className="hidden sm:block whitespace-nowrap mr-3">Added {timeAgo(createdAt)}</p>
              <p className="sm:hidden whitespace-nowrap mr-1">{timeAgo(createdAt, true)}</p>
            </time>
          </Tooltip>

          {(session?.user?.superadmin || ['member', 'manager', 'owner'].includes(user?.role)) && (
            <Popover
              content={
                <div className="w-full sm:w-48 p-2 grid gap-1">
                  <button
                    onClick={() => {
                      setOpenPopover(false);
                      setShowAddEditLinkModal(true);
                    }}
                    className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-500 transition-all duration-75 hover:bg-gray-100"
                  >
                    <IconMenu text="Edit" icon={<Edit className="h-4 w-4" />} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!archived) {
                        setOpenPopover(false);
                        setShowArchiveLinkModal(true);
                        return;
                      }
                      setUnarchiving(true);
                      fetch(`/api/projects/${slug}/links/${encodeURIComponent(props.key)}/archive`, { method: 'DELETE' }).then(async (res) => {
                        setUnarchiving(false);
                        setOpenPopover(false);
                        if (res.status === 200) {
                          mutate(`/api/projects/${slug}/links${getQueryString(router)}`);
                          setShowArchiveLinkModal(false);
                        }
                      });
                    }}
                    className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-500 transition-all duration-75 hover:bg-gray-100"
                  >
                    <IconMenu
                      text={!archived ? 'Archive' : unarchiving ? 'Unarchiving...' : 'Remove from archive'}
                      icon={<Archive className="h-4 w-4" />}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setOpenPopover(false);
                      setShowDeleteLinkModal(true);
                    }}
                    className="w-full rounded-md p-2 text-left text-sm font-medium text-red-600 transition-all duration-75 hover:bg-red-600 hover:text-white"
                  >
                    <IconMenu text="Delete" icon={<Delete className="h-4 w-4" />} />
                  </button>
                </div>
              }
              align="end"
              openPopover={openPopover}
              setOpenPopover={setOpenPopover}
            >
              <button
                type="button"
                onClick={() => setOpenPopover(!openPopover)}
                className="rounded-md px-1 py-2 hover:bg-gray-100 active:bg-gray-200 transition-all duration-75"
              >
                <ThreeDots className="w-5 h-5 text-gray-500" />
              </button>
            </Popover>
          )}
        </div>
      </li>
    </div>
  );
}
