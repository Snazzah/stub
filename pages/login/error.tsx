import { GetServerSideProps } from 'next';
import Link from 'next/link';

import Meta from '@/components/layout/meta';

interface Props {
  header: string;
  content: string;
}

export default function Login({ header, content }: Props) {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
      <Meta pageTitle={header} />
      <div className="flex flex-col space-y-4 w-full max-w-md py-12 px-4 sm:px-16 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <h1 className="font-bold font-display text-3xl">{header}</h1>
        <p className="text-gray-600 text-sm">{content}</p>
        <p className="text-gray-600 text-sm">
          <Link href="/login">
            <a className="text-gray-800 font-semibold">Back to sign in</a>
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async function ({ query }) {
  const error = query.error as string;
  if (!error) return { redirect: { destination: '/login', permanent: false } };
  const errType = String(error).toLowerCase();

  switch (errType) {
    case 'accessdenied':
      return {
        props: {
          header: 'Access Denied',
          content: 'You do not have permission to sign in.'
        }
      };
    case 'configuration':
      return {
        props: {
          header: 'Server Error',
          content: 'There is a problem with the server configuration. Check the server logs for more information.'
        }
      };
    case 'verification':
      return {
        props: {
          header: 'Unable to sign in',
          content: 'The sign in link is no longer valid. It may have been used already or it may have expired.'
        }
      };
    case 'registerclosed':
      return {
        props: {
          header: 'Access Denied',
          content: 'This instance is not accepting new users.'
        }
      };
    default:
      return {
        props: {
          header: 'Error',
          content: String(error)
        }
      };
  }
};
