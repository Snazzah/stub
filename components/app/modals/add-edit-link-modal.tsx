import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { mutate } from 'swr';
import { useDebounce } from 'use-debounce';

import BlurImage from '@/components/shared/blur-image';
import { AlertCircleFill, ChevronRight, LoadingCircle, LoadingDots, Logo, Star } from '@/components/shared/icons';
import Modal from '@/components/shared/modal';
import useProject from '@/lib/swr/use-project';
import { LinkProps } from '@/lib/types';
import { linkConstructor } from '@/lib/utils';

// TODO replace og image with some image url stuff
// TODO allow decscription editing

function AddEditLinkModal({
  showAddEditLinkModal,
  setShowAddEditLinkModal,
  props
}: {
  showAddEditLinkModal: boolean;
  setShowAddEditLinkModal: Dispatch<SetStateAction<boolean>>;
  props?: LinkProps;
}) {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { project: { domain } = {} } = useProject();

  const [keyExistsError, setKeyExistsError] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<LinkProps>(
    props || {
      key: '',
      url: '',
      title: ''
    }
  );
  const { key, url, title } = data;

  const heroProps = useMemo(() => {
    if (props?.url) {
      const urlHostname = new URL(props.url).hostname;
      return {
        avatar: `https://logo.clearbit.com/${urlHostname}`,
        copy: `Edit ${linkConstructor({
          key: props.key,
          domain,
          pretty: true
        })}`
      };
    } else {
      return {
        avatar: null,
        copy: 'Add a new link'
      };
    }
  }, [props]);

  const [debouncedKey] = useDebounce(key, 500);
  useEffect(() => {
    if (debouncedKey.length > 0 && debouncedKey !== props?.key) {
      fetch(`/api/projects/${slug}/links/${encodeURIComponent(debouncedKey)}/exists`).then(async (res) => {
        if (res.status === 200) {
          const exists = await res.json();
          setKeyExistsError(exists === 1);
        }
      });
    }
  }, [debouncedKey]);

  const generateRandomSlug = useCallback(async () => {
    setGeneratingSlug(true);
    const res = await fetch(`/api/projects/${slug}/links/random`);
    const key = await res.json();
    setData((prev) => ({ ...prev, key }));
    setGeneratingSlug(false);
  }, []);

  const [debouncedUrl] = useDebounce(url, 500);
  useEffect(() => {
    if (debouncedUrl.length > 0 && title.length === 0) {
      // only fetch title if user hasn't entered one
      generateTitleFromUrl(debouncedUrl);
    }
  }, [debouncedUrl]);

  const generateTitleFromUrl = useCallback(
    (debouncedUrl: string) => {
      setGeneratingTitle(true);
      fetch(`/api/link-metadata?url=${debouncedUrl}`).then(async (res) => {
        if (res.status === 200) {
          const results = await res.json();
          setData((prev) => ({ ...prev, title: results.title ?? '' }));
          setGeneratingTitle(false);
        }
      });
    },
    [debouncedUrl]
  );

  const endpoint = useMemo(() => {
    if (props?.key) {
      return {
        method: 'PUT',
        url: `/api/projects/${slug}/links/${encodeURIComponent(props.key)}`
      };
    } else {
      return {
        method: 'POST',
        url: `/api/projects/${slug}/links`
      };
    }
  }, [props]);

  return (
    <Modal showModal={showAddEditLinkModal} setShowModal={setShowAddEditLinkModal}>
      <div className="inline-block w-full sm:max-w-md overflow-hidden align-middle transition-all transform bg-white sm:border sm:border-gray-200 shadow-xl sm:rounded-2xl">
        <div className="flex flex-col justify-center items-center space-y-3 sm:px-16 px-4 pt-8 py-4 border-b border-gray-200">
          {heroProps.avatar ? (
            <BlurImage src={heroProps.avatar} alt={heroProps.copy} className="w-10 h-10 rounded-full border border-gray-200" width={40} height={40} />
          ) : (
            <Logo className="w-10 h-10" />
          )}
          <h3 className="font-medium text-lg">{heroProps.copy}</h3>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            fetch(endpoint.url, {
              method: endpoint.method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
              .then((res) => {
                setSaving(false);
                if (res.status === 200) {
                  mutate(`/api/projects/${slug}/links`);
                  setShowAddEditLinkModal(false);
                }
              })
              .catch(() => {
                setSaving(false);
                setKeyExistsError(true);
              });
          }}
          className="flex flex-col space-y-6 text-left bg-gray-50 sm:px-16 px-4 py-8"
        >
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                Short Link
              </label>
              <button
                className="hover:text-black active:scale-95 flex items-center space-x-2 text-gray-500 text-sm transition-all duration-75"
                onClick={generateRandomSlug}
                disabled={generatingSlug}
                type="button"
              >
                {generatingSlug && <LoadingCircle />}
                <p>{generatingSlug ? 'Generating' : 'Generate random slug'}</p>
              </button>
            </div>
            <div className="relative flex mt-1 rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-5 text-gray-500 sm:text-sm whitespace-nowrap">
                {domain}
              </span>
              <input
                type="text"
                name="key"
                id="key"
                required
                autoFocus={false}
                pattern="[a-zA-Z0-9\-/]+|:index"
                className={`${
                  keyExistsError
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500'
                } pr-10 block w-full rounded-r-md focus:outline-none sm:text-sm`}
                placeholder="github"
                value={key}
                onChange={(e) => {
                  setKeyExistsError(false);
                  setData({ ...data, key: e.target.value });
                }}
                aria-invalid="true"
                aria-describedby="key-error"
              />
              {keyExistsError && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircleFill className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {key === ':index' && (
              <div className="mt-1 text-xs border border-yellow-600 rounded bg-yellow-400/25 px-2 py-1 flex items-center gap-2" id="index-highlight">
                <Star className="w-4 h-4 flex-none text-amber-400 drop-shadow" />
                <span className="text-gray-700">
                  Using <b>:index</b> as a key will allow redirects from <b>{domain}</b>!
                </span>
              </div>
            )}
            {keyExistsError && (
              <p className="mt-2 text-sm text-red-600" id="key-error">
                Short link is already in use.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Destination URL
            </label>
            <div className="flex mt-1 rounded-md shadow-sm">
              <input
                name="url"
                id="url"
                type="url"
                required
                className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
                placeholder="https://github.com/Snazzah/stub"
                value={url}
                onChange={(e) => {
                  setData({ ...data, url: e.target.value });
                }}
                aria-invalid="true"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <button
                className={`${
                  url.length === 0 ? 'cursor-not-allowed text-gray-300' : 'hover:text-black active:scale-95'
                } flex items-center space-x-2 text-gray-500 text-sm transition-all duration-75`}
                onClick={() => generateTitleFromUrl(url)}
                disabled={url.length === 0 || generatingTitle}
                type="button"
              >
                {generatingTitle && <LoadingCircle />}
                <p>{generatingTitle ? 'Generating' : 'Generate from URL'}</p>
              </button>
            </div>
            <div className="flex mt-1 rounded-md shadow-sm">
              <input
                name="title"
                id="title"
                type="text"
                required
                className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
                placeholder="Dub - an open-source link shortener SaaS with built-in analytics + free custom domains."
                value={title}
                onChange={(e) => {
                  setData({ ...data, title: e.target.value });
                }}
                aria-invalid="true"
              />
            </div>
          </div>

          <AdvancedSettings data={data} setData={setData} debouncedUrl={debouncedUrl} />

          <button
            disabled={saving || keyExistsError}
            className={`${
              saving || keyExistsError
                ? 'cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                : 'bg-black hover:bg-white hover:text-black border-black text-white'
            } flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none`}
          >
            {saving ? <LoadingDots color="#808080" /> : <p>{props ? 'Save changes' : 'Add link'}</p>}
          </button>
        </form>
      </div>
    </Modal>
  );
}

function AdvancedSettings({ data, setData, debouncedUrl }) {
  const [expanded, setExpanded] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const { url, description, image } = data;

  useEffect(() => {
    if (debouncedUrl.length > 0 && description?.length === 0) {
      // only fetch title if user hasn't entered one
      generateTitleFromUrl(debouncedUrl);
    }
  }, [debouncedUrl]);

  const generateTitleFromUrl = useCallback(
    (debouncedUrl: string) => {
      setGeneratingDescription(true);
      fetch(`/api/link-metadata?url=${debouncedUrl}`).then(async (res) => {
        if (res.status === 200) {
          const results = await res.json();
          setData((prev) => ({ ...prev, description: results.description ?? '' }));
          setGeneratingDescription(false);
        }
      });
    },
    [debouncedUrl]
  );

  return (
    <div>
      <button type="button" className="flex items-center" onClick={() => setExpanded(!expanded)}>
        <ChevronRight className={`h-5 w-5 text-gray-600 ${expanded ? 'rotate-90' : ''} transition-all`} />
        <p className="text-gray-600 text-sm">Advanced options</p>
      </button>

      {expanded && (
        <div className="mt-4 grid gap-5">
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                className={`${
                  url.length === 0 ? 'cursor-not-allowed text-gray-300' : 'hover:text-black active:scale-95'
                } flex items-center space-x-2 text-gray-500 text-sm transition-all duration-75`}
                onClick={() => generateTitleFromUrl(url)}
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
                value={description}
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

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              OG Image URL
            </label>
            <p className="text-gray-500 text-xs">Recommended: 1200 x 627 pixels</p>
            <div className="flex mt-1 rounded-md shadow-sm">
              <input
                name="url"
                id="url"
                type="url"
                required
                className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 block w-full rounded-md focus:outline-none sm:text-sm"
                placeholder="https://github.com/steven-tey/dub/raw/main/public/static/thumbnail.png"
                value={image}
                onChange={(e) => {
                  setData({ ...data, image: e.target.value });
                }}
                aria-invalid="true"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddEditLinkButton({ setShowAddEditLinkModal }: { setShowAddEditLinkModal: Dispatch<SetStateAction<boolean>> }) {
  return (
    <button
      onClick={() => setShowAddEditLinkModal(true)}
      className="text-white hover:text-black bg-black hover:bg-white active:scale-95 font-medium text-sm px-5 py-2 border rounded-md border-black transition-all duration-75"
    >
      Add
    </button>
  );
}

export function useAddEditLinkModal({ props }: { props?: LinkProps }) {
  const [showAddEditLinkModal, setShowAddEditLinkModal] = useState(false);

  const AddEditLinkModalCallback = useCallback(() => {
    return <AddEditLinkModal showAddEditLinkModal={showAddEditLinkModal} setShowAddEditLinkModal={setShowAddEditLinkModal} props={props} />;
  }, [showAddEditLinkModal, setShowAddEditLinkModal, props]);

  const AddEditLinkButtonCallback = useCallback(() => {
    return <AddEditLinkButton setShowAddEditLinkModal={setShowAddEditLinkModal} />;
  }, [setShowAddEditLinkModal]);

  return useMemo(
    () => ({
      setShowAddEditLinkModal,
      AddEditLinkModal: AddEditLinkModalCallback,
      AddEditLinkButton: AddEditLinkButtonCallback
    }),
    [setShowAddEditLinkModal, AddEditLinkModalCallback, AddEditLinkButtonCallback]
  );
}
