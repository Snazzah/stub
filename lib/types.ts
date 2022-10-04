import { User } from '@prisma/client';

export interface SimpleLinkProps {
  key: string;
  url: string;
}

export interface LinkProps {
  key: string;
  url: string;
  title: string;
  timestamp?: number;
  description?: string;
  image?: string;
}

export interface ProjectProps {
  name: string;
  slug: string;
  domain: string;
}

export interface ProjectUserProps {
  role: 'member' | 'owner';
}

export interface ProjectResponseProps {
  project: ProjectProps;
  user: ProjectUserProps;
}

export interface IpGeo {
  city: string;
  region: string;
  country: string;
}

export interface AppSettingsProps {
  appId: string;
  allowNewUsers: boolean;
  registerEmailFilters: string[];
}

export interface AdminUserProps {
  user: User;
  accounts: {
    id: string;
    provider: string;
    providerAccountId: string;
  }[];
  lastLogin: string;
}
