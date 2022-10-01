import Router, { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import BlurImage from '@/components/shared/blur-image';
import LoadingDots from '@/components/shared/icons/loading-dots';
import Modal from '@/components/shared/modal';
import useProject from '@/lib/swr/use-project';
import { fetcher, nFormatter } from '@/lib/utils';

function EditDomainModal({
  showDeleteProjectModal,
  setShowDeleteProjectModal
}: {
  showDeleteProjectModal: boolean;
  setShowDeleteProjectModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [deleting, setDeleting] = useState(false);
  const [inputText, setInputText] = useState('');
  const { project } = useProject();

  const { data: count, isValidating } = useSWR<number>(`/api/projects/${slug}/links/count`, fetcher, {
    keepPreviousData: true
  });

  return (
    <Modal showModal={showDeleteProjectModal} setShowModal={setShowDeleteProjectModal}>
      <div className="inline-block w-full sm:max-w-md overflow-hidden align-middle transition-all transform bg-white sm:border sm:border-gray-200 shadow-xl sm:rounded-2xl">
        <div className="flex flex-col justify-center items-center space-y-3 sm:px-16 px-4 pt-8 py-4 border-b border-gray-200">
          <BlurImage
            src={`https://avatar.tobi.sh/${slug}`}
            alt={project?.name ?? slug}
            className="w-10 h-10 rounded-full border border-gray-200"
            width={20}
            height={20}
          />
          <h3 className="font-medium text-lg">Delete {project?.name}</h3>
          <p className="text-sm text-gray-500">
            Warning: Deleting this project will remove <b>{isValidating ? 'all links' : `${nFormatter(count)} link${count === 1 ? '' : 's'}`}</b> and
            their stats.
          </p>
          <p className="text-sm text-gray-500">No going back after confirming. Please be sure you want to do this.</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setDeleting(true);
            fetch(`/api/projects/${slug}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              }
            }).then(async (res) => {
              setDeleting(false);
              if (res.status === 204) {
                mutate('/api/projects');
                setShowDeleteProjectModal(false);
                Router.push('/');
              }
            });
          }}
          className="flex flex-col space-y-6 text-left bg-gray-50 sm:px-16 px-4 py-8"
        >
          <div>
            <label htmlFor="verification" className="block text-sm text-gray-700">
              To verify, type <span className="font-semibold">{slug}</span> below
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="verification"
                id="verification"
                pattern={slug}
                required
                autoFocus={false}
                className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-10 block w-full rounded-md focus:outline-none sm:text-sm"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={deleting || inputText !== slug}
            className={`${
              deleting || inputText !== slug
                ? 'cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                : 'bg-red-600 hover:bg-white hover:text-red-600 border-red-600 text-white'
            } flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none`}
          >
            {deleting ? <LoadingDots color="#808080" /> : <p>Confirm delete</p>}
          </button>
        </form>
      </div>
    </Modal>
  );
}

export function useDeleteProjectModal() {
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  const DeleteProjectModalCallback = useCallback(() => {
    return <EditDomainModal showDeleteProjectModal={showDeleteProjectModal} setShowDeleteProjectModal={setShowDeleteProjectModal} />;
  }, [showDeleteProjectModal, setShowDeleteProjectModal]);

  return useMemo(
    () => ({
      setShowDeleteProjectModal,
      DeleteProjectModal: DeleteProjectModalCallback
    }),
    [setShowDeleteProjectModal, DeleteProjectModalCallback]
  );
}
