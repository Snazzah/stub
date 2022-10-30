import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { ChevronDown, Tick } from '@/components/shared/icons';
import Popover from '@/components/shared/popover';

const statuses = [
  {
    display: 'Active',
    slug: 'active',
    color: 'bg-green-500'
  },
  {
    display: 'Expired',
    slug: 'expired',
    color: 'bg-amber-500'
  },
  {
    display: 'Archived',
    slug: 'archived',
    color: 'bg-gray-400'
  }
];

const statusArrToStr = (newStatusArr: string[]) => {
  if (['active', 'expired', 'archived'].every((s) => newStatusArr.includes(s))) {
    return 'all';
  } else if (newStatusArr.length === 0) {
    return 'none';
  } else if (newStatusArr.includes('active') && newStatusArr.length === 1) {
    return 'default';
  } else {
    return newStatusArr.join(',');
  }
};

export default function StatusFilter() {
  const [openPopover, setOpenPopover] = useState(false);
  const router = useRouter();
  const { status } = router.query as { status?: string };
  const selectedStatus = useMemo(() => {
    if (!status) {
      return ['active'];
    } else if (status === 'all' || status === 'none') {
      return ['active', 'expired', 'archived'];
    } else {
      return status.split(',');
    }
  }, [status]);

  return (
    <Popover
      content={
        <div className="w-full p-2 md:w-44">
          {statuses.map(({ display, slug, color }) => (
            <button
              key={slug}
              onClick={() => {
                let newStatusArr;
                if (selectedStatus.includes(slug)) {
                  if (status === 'none') {
                    newStatusArr = [slug];
                  } else {
                    newStatusArr = selectedStatus.filter((s) => s !== slug);
                  }
                } else {
                  newStatusArr = [...selectedStatus, slug];
                }
                let newQuery;
                if (statusArrToStr(newStatusArr) === 'default') {
                  delete router.query.status;
                  newQuery = { ...router.query };
                } else {
                  newQuery = {
                    ...router.query,
                    status: statusArrToStr(newStatusArr)
                  };
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { slug: _, ...finalQuery } = newQuery;
                router.push({
                  pathname: `/p/${router.query.slug}`,
                  query: finalQuery
                });
              }}
              className="flex w-full items-center justify-between rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
            >
              <div className="flex items-center justify-start space-x-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <p className="text-sm text-gray-700">{display}</p>
              </div>
              {(status === 'all' || (selectedStatus.includes(slug) && status !== 'none')) && <Tick className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      <button
        onClick={() => setOpenPopover(!openPopover)}
        className="flex w-full items-center justify-between space-x-2 rounded-md bg-white px-3 py-2.5 shadow transition-all duration-75 hover:shadow-md active:scale-95 sm:w-44"
      >
        <div className="flex items-center space-x-2 text-gray-700">
          <div className="flex -space-x-1">
            {statuses.map(({ slug, color }) => (
              <div key={slug} className={`h-3.5 w-3.5 rounded-full ${selectedStatus.includes(slug) ? color : 'bg-gray-200'} border border-white`} />
            ))}
          </div>
          <p className="text-sm">Status</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 ${openPopover ? 'rotate-180 transform' : ''} transition-all duration-75`} />
      </button>
    </Popover>
  );
}
