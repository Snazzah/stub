import AppLayout from 'components/layout/app';
import ErrorPage from 'next/error';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import LinksContainer from '@/components/app/links/links-container';
import { useAcceptInviteModal } from '@/components/app/modals/accept-invite-modal';
import { useAddEditLinkModal } from '@/components/app/modals/add-edit-link-modal/index';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import { serverSidePropsAuth } from '@/lib/auth';
import useProject from '@/lib/swr/use-project';

export default function ProjectLinks() {
  const { project, user, error } = useProject();
  const { data: session } = useSession();

  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal({});

  const { AcceptInviteModal, setShowAcceptInviteModal } = useAcceptInviteModal();

  // handle errors
  useEffect(() => {
    if (error && (error.status === 409 || error.status === 410)) {
      setShowAcceptInviteModal(true);
    }
  }, [error]);

  // handle error page
  if (error && error.status === 404) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <AppLayout pageTitle={project && project.name}>
      {project && <AddEditLinkModal />}
      {error && (error.status === 409 || error.status === 410) && <AcceptInviteModal />}
      <div className="h-20 md:h-36 flex items-center bg-white border-b border-gray-200">
        <MaxWidthWrapper>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-gray-600">Links</h1>
            {(session?.user?.superadmin || ['member', 'manager', 'owner'].includes(user?.role)) && <AddEditLinkButton />}
          </div>
        </MaxWidthWrapper>
      </div>
      <LinksContainer AddEditLinkButton={AddEditLinkButton} />
    </AppLayout>
  );
}

export const getServerSideProps = serverSidePropsAuth;
