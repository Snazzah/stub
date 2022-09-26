import AppLayout from 'components/layout/app';
import ErrorPage from 'next/error';

import CustomDomain from '@/components/app/custom-domain';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import useProject from '@/lib/swr/use-project';

export default function ProjectLinks() {
  const { project, error } = useProject();

  // handle error page
  if (error && error.status === 404) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <AppLayout pageTitle={`Project Settings${project ? ` - ${project.name}` : ''}`}>
      <div className="h-36 flex items-center bg-white border-b border-gray-200">
        <MaxWidthWrapper>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-gray-600">Project Settings</h1>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper>
        <div className="py-10 grid gap-5">
          <CustomDomain />
        </div>
      </MaxWidthWrapper>
    </AppLayout>
  );
}
