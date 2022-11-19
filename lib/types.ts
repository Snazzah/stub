import { User } from '@prisma/client';

export interface SimpleLinkProps {
  key: string;
  url: string;
}

export interface LinkProps {
  id?: string;
  domain: string;
  key: string;
  url: string;
  archived: boolean;
  expiresAt: Date | null;
  password: string | null;

  title: string | null;
  description: string | null;
  image: string | null;

  clicks: number;
  userId: string;

  createdAt: Date;
}

export interface ProjectProps {
  id: string;
  name: string;
  slug: string;
  domain: string;
  users?: {
    role: string;
  }[];
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

export interface ProjectUserProps {
  role: 'viewer' | 'member' | 'manager' | 'owner';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string;
  stripeId: string;
  usageLimit: number;
  joinedAt?: Date;
  projects?: { projectId: string }[];
}
