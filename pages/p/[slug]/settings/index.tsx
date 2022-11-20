import { useSession } from 'next-auth/react';

import CustomDomain from '@/components/app/settings/custom-domain';
import SettingsLayout from '@/components/app/settings/layout';
import ProjectDangerZone from '@/components/app/settings/project-danger-zone';
import useProject from '@/lib/swr/use-project';

export default function ProjectSettingsGeneral() {
  const { project, user } = useProject();
  const { data: session } = useSession();

  return (
    <SettingsLayout pageTitle={`Project Settings${project ? ` - ${project.name}` : ''}`}>
      <CustomDomain />
      {(user?.role === 'owner' || session?.user?.superadmin) && <ProjectDangerZone />}
    </SettingsLayout>
  );
}
