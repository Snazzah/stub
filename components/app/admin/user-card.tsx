import type { User } from '@prisma/client';
import Link from 'next/link';

import SuperAdmin from '@/components/shared/icons/superadmin';

export default function UserCard({ user }: { user: User }) {
  return (
    <Link key={user.id} href={`/admin/users/${user.id}`}>
      <a>
        <div className="bg-white shadow rounded-lg p-6 flex justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 w-full overflow-hidden relative">
            <img
              src={user?.image || `https://avatars.dicebear.com/api/micah/${user?.email}.svg`}
              alt={user.name}
              className="w-12 h-12 flex-none rounded-full overflow-hidden border border-gray-300"
              width={48}
              height={48}
            />
            <div className="w-4/5">
              <h2 className="text-lg font-medium text-gray-700 flex gap-2 items-center">
                <span className="truncate">{user.name}</span>
                <SuperAdmin className="w-5 h-5 flex-none" />
              </h2>
              <div className="flex items-center">
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2" />
        </div>
      </a>
    </Link>
  );
}
