import Head from 'next/head';

import { FAVICON_FOLDER } from '@/lib/constants';

export default function Meta({ pageTitle }: { pageTitle?: string }) {
  return (
    <Head>
      <title>{pageTitle ? `${pageTitle} - Stub` : 'Stub'}</title>
      <meta name="description" content="A self-hostable fork of Dub: An open-source link shortener." />
      <link rel="apple-touch-icon" sizes="180x180" href={`${FAVICON_FOLDER}/apple-touch-icon.png`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${FAVICON_FOLDER}/favicon-32x32.png`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`${FAVICON_FOLDER}/favicon-16x16.png`} />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href={`${FAVICON_FOLDER}/safari-pinned-tab.svg`} color="#f59e0b" />
      <meta name="msapplication-TileColor" content="#f59e0b" />
      <meta name="theme-color" content="#f59e0b" />

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content="link shortener, bitly, open source" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta itemProp="image" content="/static/logo.png" />
      <meta property="og:logo" content="/static/logo.png" />
      <meta property="og:image" content="/static/logo.png" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="@snazzah" />
      <meta name="twitter:title" content="Stub - Open-source Bitly Alternative" />
      <meta name="twitter:description" content="A self-hostable fork of Dub: An open-source link shortener." />
      <meta name="twitter:image" content="/static/logo.png" />
    </Head>
  );
}
