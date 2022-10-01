import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';

import { AlertCircleFill, CheckCircleFill, ExternalLink, LoadingDots } from '@/components/shared/icons';
import useProject from '@/lib/swr/use-project';
import { fetcher } from '@/lib/utils';

import { useEditDomainModal } from './modals/edit-domain-modal';

export default function CustomDomain() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { project: { domain } = {} } = useProject();

  const { data: domainStatus, isValidating } = useSWR<boolean>(slug && domain && `/api/domains/${domain}/verify`, fetcher);

  const { setShowEditDomainModal, EditDomainModal } = useEditDomainModal();

  return (
    <div className="bg-white rounded-lg border border-gray-200 py-10">
      {domain && <EditDomainModal />}
      <div className="flex flex-col space-y-3 px-10">
        <h2 className="text-xl font-medium">Custom Domain</h2>
        <p className="text-gray-500 text-sm">This is the custom domain associated with your project.</p>
      </div>
      <div className="border-b border-gray-200 my-8" />
      <div className="flex flex-col space-y-3 px-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {domain ? (
            <a href={`http://${domain}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2">
              <p className="text-xl font-semibold flex items-center">{domain}</p>
              <ExternalLink className="w-5 h-5" />
            </a>
          ) : (
            <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
          )}
          <div className="flex space-x-3">
            {domain ? (
              <button
                onClick={() => {
                  mutate(`/api/domains/${domain}/verify`);
                }}
                disabled={isValidating}
                className={`${
                  isValidating ? 'cursor-not-allowed bg-gray-100' : 'bg-white hover:text-black hover:border-black'
                } text-gray-500 border-gray-200 h-9 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150`}
              >
                {isValidating ? <LoadingDots /> : 'Verify'}
              </button>
            ) : (
              <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse" />
            )}
            {domain ? (
              <button
                onClick={() => setShowEditDomainModal(true)}
                className="bg-black text-white border-black hover:text-black hover:bg-white h-9 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150"
              >
                Change
              </button>
            ) : (
              <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center items-start gap-2">
          <p className="text-sm text-gray-500">Make sure that this domain's CNAME or A record has been configured properly.</p>
          {!isValidating && (
            <p className={`flex items-center gap-2 text-sm ${domainStatus ? 'text-green-600' : 'text-amber-500'}`}>
              {domainStatus ? (
                <>
                  <CheckCircleFill /> <span>This domain is working properly.</span>
                </>
              ) : (
                <>
                  <AlertCircleFill /> <span>This domain isn't working!</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
