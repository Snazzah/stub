import Link from 'next/link';
import useSWR from 'swr';

import BlurImage from '@/components/shared/blur-image';
import { Link as LinkIcon } from '@/components/shared/icons';
import { ProjectProps } from '@/lib/types';
import { fetcher, nFormatter } from '@/lib/utils';

export default function ProjectCard({ name, slug, domain }: ProjectProps) {
  const { data: count, isValidating } = useSWR<number>(`/api/projects/${slug}/links/count`, fetcher, {
    keepPreviousData: true
  });

  return (
    <Link key={slug} href={`/p/${slug}`}>
      <a>
        <div className="bg-white shadow rounded-lg p-6 flex justify-between hover:shadow-md transition-all">
          <div className="flex items-center space-x-3">
            <BlurImage
              src={`https://avatar.tobi.sh/${slug}`}
              alt={name}
              className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden border border-gray-300"
              width={48}
              height={48}
            />
            <div>
              <h2 className="text-lg font-medium text-gray-700">{name}</h2>
              <div className="flex items-center">
                <p className="text-gray-500">{domain}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LinkIcon className="text-gray-600 w-5 h-5" />
            {isValidating ? (
              <div className="w-4 h-5 rounded-md bg-gray-200 animate-pulse" />
            ) : (
              <h2 className="text-lg font-medium text-gray-700">{nFormatter(count)}</h2>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
