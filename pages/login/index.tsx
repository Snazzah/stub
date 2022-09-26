import { GetStaticProps } from 'next';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import Meta from '@/components/layout/meta';
import { Discord, Facebook, Github, Google, LoadingDots, Twitter } from '@/components/shared/icons';
import { availableProviders } from '@/lib/utils';

interface Props {
  providers: string[];
}

export default function Login({ providers }: Props) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [email, setEmail] = useState('');
  const [buttonText, setButtonText] = useState('Send magic link');

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-50">
      <Meta pageTitle="Sign In" />
      <div className="flex flex-col space-y-4 w-full max-w-md py-12 px-4 sm:px-16 overflow-hidden text-center align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <h1 className="font-bold font-display text-3xl">Sign In</h1>
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
            <span>Sign in with Discord</span>
          </button>
        )}
        {providers.includes('github') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('github', { callbackUrl: '/' })}
          >
            <Github className="w-6 h-6" />
            <span>Sign in with GitHub</span>
          </button>
        )}
        {providers.includes('twitter') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('twitter', { callbackUrl: '/' })}
          >
            <Twitter className="w-6 h-6" />
            <span>Sign in with Twitter</span>
          </button>
        )}
        {providers.includes('facebook') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('facebook', { callbackUrl: '/' })}
          >
            <Facebook className="w-6 h-6" />
            <span>Sign in with Facebook</span>
          </button>
        )}
        {providers.includes('google') && (
          <button
            className="bg-black hover:bg-white text-white hover:text-black border-black flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none gap-2"
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            <Google className="w-6 h-6" />
            <span>Sign in with Google</span>
          </button>
        )}
        {providers.includes('email') && providers.length > 1 && <hr />}
        {providers.includes('email') && (
          <>
            <p className="text-gray-600 text-sm">Use your email address to sign in.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSignInClicked(true);
                signIn('email', {
                  email,
                  redirect: false
                }).then((res) => {
                  setSignInClicked(false);
                  if (res?.ok && !res?.error) {
                    setButtonText('Email sent - check your inbox!');
                  } else {
                    setButtonText(`Error sending email - ${res.error}`);
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
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
              <button
                disabled={signInClicked}
                className={`${
                  signInClicked
                    ? 'cursor-not-allowed bg-gray-100 border-gray-200'
                    : 'bg-black hover:bg-white text-white hover:text-black border-black'
                } flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none`}
              >
                {signInClicked ? <LoadingDots color="#808080" /> : <p>{buttonText}</p>}
              </button>
            </form>
          </>
        )}
        <p className="text-gray-600 text-sm">Don't have an account? Using any of the sign-in above methods will make an account for you!</p>
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
