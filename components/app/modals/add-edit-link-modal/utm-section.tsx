import { motion } from 'framer-motion';
import { Dispatch, SetStateAction, useMemo } from 'react';

import { LinkProps } from '@/lib/types';
import { constructURLFromUTMParams, getParamsFromURL } from '@/lib/utils';

import { AnimationSettings } from './advanced-settings';

const paramsMetadata = [
  { display: 'Source', key: 'utm_source', examples: 'twitter, facebook' },
  { display: 'Medium', key: 'utm_medium', examples: 'social, email' },
  { display: 'Campaign', key: 'utm_campaign', examples: 'summer_sale' },
  { display: 'Term', key: 'utm_term', examples: 'blue_shoes' },
  { display: 'Content', key: 'utm_content', examples: 'logolink' }
];

export default function UTMSection({ data, setData }: { data: LinkProps; setData: Dispatch<SetStateAction<LinkProps>> }) {
  const { url } = data;
  const isValidUrl = useMemo(() => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, [url]);

  const params = useMemo(() => {
    return getParamsFromURL(url);
  }, [url]);

  return (
    <motion.div key="og" className="grid gap-5" {...AnimationSettings}>
      <p className="block mt-2 text-sm text-gray-500 px-5">
        If you use custom OG tags, <span className="font-semibold text-black">be sure to set the source, medium, and campaign</span>.
      </p>
      <div className="border-t border-gray-200 px-5 pt-5 pb-2.5 grid gap-3">
        {paramsMetadata.map(({ display, key, examples }) => (
          <div key={key} className="relative flex mt-1 rounded-md shadow-sm">
            <span className="flex justify-center items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 w-40 text-gray-500 sm:text-sm whitespace-nowrap">
              {display}
            </span>
            <input
              type="text"
              name={key}
              id={key}
              disabled={!isValidUrl}
              className={`${
                isValidUrl ? '' : 'cursor-not-allowed bg-gray-100'
              } border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-r-md focus:outline-none sm:text-sm`}
              placeholder={examples}
              value={params[key] || ''}
              onChange={(e) => {
                setData({
                  ...data,
                  url: constructURLFromUTMParams(url, {
                    ...params,
                    [key]: e.target.value
                  })
                });
              }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
