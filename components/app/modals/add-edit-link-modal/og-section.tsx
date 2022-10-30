import { motion } from 'framer-motion';
import { Dispatch, SetStateAction, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { LoadingCircle } from '@/components/shared/icons';
import { LinkProps } from '@/lib/types';

import { AnimationSettings } from './advanced-settings';

export default function OGSection({ data, setData }: { data: LinkProps; setData: Dispatch<SetStateAction<LinkProps>> }) {
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const { url, title, description, image } = data;

  const generateTitleFromUrl = async () => {
    setGeneratingTitle(true);
    fetch(`/api/link-metadata?url=${url}`).then(async (res) => {
      if (res.status === 200) {
        const results = await res.json();
        setData((prev) => ({ ...prev, title: results.title ?? '' }));
        setGeneratingTitle(false);
      }
    });
  };

  const generateDescriptionFromUrl = async () => {
    setGeneratingDescription(true);
    fetch(`/api/link-metadata?url=${url}`).then(async (res) => {
      if (res.status === 200) {
        const results = await res.json();
        setData((prev) => ({ ...prev, description: results.description ?? '' }));
        setGeneratingTitle(false);
      }
    });
  };

  return (
    <motion.div key="og" className="grid gap-5" {...AnimationSettings}>
      <p className="block mt-2 text-sm text-gray-500 px-5">
        If you use custom OG tags, <span className="font-semibold text-black">be sure to set all 3 tags</span>, or the default tags of the target URL
        will be used.
      </p>
      <div className="border-t border-gray-200 px-5 pt-5 pb-2.5">
        <div className="flex justify-between items-center">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            OG Title
          </label>
          <button
            className={`${
              url.length === 0 ? 'cursor-not-allowed text-gray-300' : 'hover:text-black active:scale-95'
            } flex items-center space-x-2 text-gray-500 text-sm transition-all duration-75`}
            onClick={() => generateTitleFromUrl()}
            disabled={url.length === 0 || generatingTitle}
            type="button"
          >
            {generatingTitle && <LoadingCircle />}
            <p>{generatingTitle ? 'Generating' : 'Generate from URL'}</p>
          </button>
        </div>
        <div className="flex mt-1 rounded-md shadow-sm">
          <TextareaAutosize
            name="title"
            id="title"
            minRows={3}
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-10 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder="Dub - Open Source Bitly Alternative"
            value={title || ''}
            onChange={(e) => {
              setData({ ...data, title: e.target.value });
            }}
            aria-invalid="true"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 px-5 pt-5 pb-2.5">
        <div className="flex justify-between items-center">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            OG Description
          </label>
          <button
            className={`${
              url.length === 0 ? 'cursor-not-allowed text-gray-300' : 'hover:text-black active:scale-95'
            } flex items-center space-x-2 text-gray-500 text-sm transition-all duration-75`}
            onClick={() => generateDescriptionFromUrl()}
            disabled={url.length === 0 || generatingDescription}
            type="button"
          >
            {generatingDescription && <LoadingCircle />}
            <p>{generatingDescription ? 'Generating' : 'Generate from URL'}</p>
          </button>
        </div>
        <div className="flex mt-1 rounded-md shadow-sm">
          <TextareaAutosize
            name="description"
            id="description"
            minRows={3}
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-10 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder="Dub is an open-source link shortener SaaS with built-in analytics + free custom domains."
            value={description || ''}
            onChange={(e) => {
              setData({
                ...data,
                description: e.target.value.length > 0 ? e.target.value : undefined
              });
            }}
            aria-invalid="true"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 px-5 pt-5 pb-2.5">
        <div className="flex justify-between items-center">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            OG Image URL
          </label>
        </div>
        <div className="flex mt-1 rounded-md shadow-sm">
          <input
            name="imageUrl"
            id="imageUrl"
            type="url"
            className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
            placeholder="https://github.com/steven-tey/dub/raw/main/public/static/thumbnail.png"
            value={image || ''}
            onChange={(e) => {
              setData({ ...data, image: e.target.value });
            }}
            aria-invalid="true"
          />
        </div>
      </div>
    </motion.div>
  );
}
