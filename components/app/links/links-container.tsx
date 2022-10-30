import { useRouter } from 'next/router';
import useSWR from 'swr';

import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import { LinkProps } from '@/lib/types';
import { fetcher, getQueryString } from '@/lib/utils';

import LinkCard from './link-card';
import LinkCardPlaceholder from './link-card-placeholder';
import LinkFilters from './link-filters';
import NoLinksPlaceholder from './no-links-placeholder';

export default function LinksContainer({ AddEditLinkButton }: { AddEditLinkButton: () => JSX.Element }) {
  const router = useRouter();
  const { slug } = router.query as {
    slug: string;
  };

  const { data: links } = useSWR<LinkProps[]>(`/api/projects/${slug}/links${getQueryString(router)}`, fetcher);

  return (
    <MaxWidthWrapper className="pb-10">
      <LinkFilters />
      <ul className="py-10 grid grid-cols-1 gap-3">
        {links ? (
          links.length > 0 ? (
            links.map((props) => <LinkCard key={props.key} props={props} />)
          ) : (
            <NoLinksPlaceholder AddEditLinkButton={AddEditLinkButton} />
          )
        ) : (
          Array.from({ length: 3 }).map((_, i) => <LinkCardPlaceholder key={i} />)
        )}
      </ul>
    </MaxWidthWrapper>
  );
}
