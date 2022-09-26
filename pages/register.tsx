import { GetStaticProps } from 'next';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import Meta from '@/components/layout/meta';
import { Discord, Github, LoadingDots, Twitter } from '@/components/shared/icons';
import { availableProviders } from '@/lib/utils';

interface Props {
  providers: string[];
}

// TODO probably remove this, this does the same thing as login

export default function Register({ providers }: Props) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [email, setEmail] = useState('');
  const [buttonText, setButtonText] = useState('Send magic link');

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
      <Meta />
      <div className="flex flex-col space-y-4 w-full max-w-md py-12 px-4 sm:px-16 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <h1 className="font-bold font-display text-3xl">Sign Up</h1>
        {providers.length === 0 && (
          <div className="bg-red-300 border border-red-600 rounded-lg px-5 py-2 text-sm text-red-900">
            No authentication providers were given. Please contact the administrator.
          </div>
        )}
        {providers.includes('discord') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('discord', { callbackUrl: '/' })}
          >
            <Discord className="w-6 h-6" />
            <span>Sign up with Discord</span>
          </button>
        )}
        {providers.includes('github') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('github', { callbackUrl: '/' })}
          >
            <Github className="w-6 h-6" />
            <span>Sign up with GitHub</span>
          </button>
        )}
        {providers.includes('twitter') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('twitter', { callbackUrl: '/' })}
          >
            <Twitter className="w-6 h-6" />
            <span>Sign up with Twitter</span>
          </button>
        )}
        {providers.includes('email') && providers.length > 1 && <hr />}
        {providers.includes('email') && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSignInClicked(true);
              fetch('/api/auth/account-exists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              }).then(async (res) => {
                const { exists } = await res.json();
                if (!exists) {
                  signIn('email', {
                    email,
                    redirect: false
                  }).then((res) => {
                    setSignInClicked(false);
                    if (res?.ok && !res?.error) {
                      setButtonText('Email sent - check your inbox!');
                    } else {
                      setButtonText('Error sending email - try again?');
                    }
                  });
                } else {
                  setAccountExists(true);
                  setSignInClicked(false);
                }
              });
            }}
            className="mt-5 flex flex-col space-y-4"
          >
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              required
              onChange={(e) => {
                setAccountExists(false);
                setEmail(e.target.value);
              }}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            <button
              disabled={signInClicked}
              className={`${
                signInClicked ? 'cursor-not-allowed bg-gray-100 border-gray-200' : 'bg-black hover:bg-white text-white hover:text-black border-black'
              } flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none`}
            >
              {signInClicked ? <LoadingDots color="#808080" /> : <p>{buttonText}</p>}
            </button>
          </form>
        )}
        {accountExists ? (
          <p className="text-red-500 text-sm">
            This email is already registered.{' '}
            <Link href="/login">
              <a className="text-red-600 font-semibold">Log in</a>
            </Link>{' '}
            instead?
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Already registered?{' '}
            <Link href="/login">
              <a className="text-gray-800 font-semibold">Sign in</a>
            </Link>{' '}
            to your account.
          </p>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<Props> = async function () {
  return {
    props: { providers: availableProviders },
    revalidate: 3600
  };
};
