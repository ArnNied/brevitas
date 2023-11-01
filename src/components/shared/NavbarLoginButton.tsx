'use client';

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
} from 'firebase/auth';
import { useState, useCallback, useEffect } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';

import { auth } from '@/lib/client/firebase/core';
import { signInMode } from '@/lib/client/utils';

import { Modal } from './Modal';

import type { UserCredential } from 'firebase/auth';

const Providers = [
  {
    label: 'Google',
    provider: new GoogleAuthProvider(),
    icon: <FcGoogle size={25} />,
  },
  {
    label: 'Github',
    provider: new GithubAuthProvider(),
    icon: <AiFillGithub size={25} />,
  },
];

export default function NavbarLoginButton(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSignInWithProvider = useCallback(
    async (provider: GoogleAuthProvider | GithubAuthProvider) => {
      if (signInMode('GET') === 'redirect') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (err) {
          console.error(err);

          signInMode('SET', 'popup');
        }
      } else {
        try {
          const result = await signInWithPopup(auth, provider);

          console.log(result);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [],
  );

  useEffect(() => {
    async function handleSignInRedirected(): Promise<void> {
      try {
        const result = (await getRedirectResult(auth)) as UserCredential;

        console.log(result);
        console.log(auth.currentUser?.uid);
      } catch (err) {
        signInMode('SET', 'popup');

        console.error(err);
      }
    }

    handleSignInRedirected();
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={(): void => setModalOpen(true)}
        className='px-4 py-2 rounded button-primary'
      >
        Get Started
      </button>
      {/* MODAL */}
      <Modal
        title='Brevitas'
        subtitle='Please select an authentication method'
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        primary
      >
        <div className='space-y-2'>
          {Providers.map(({ label, provider, icon }) => (
            <button
              key={label}
              onClick={(): Promise<void> => handleSignInWithProvider(provider)}
              className='relative flex flex-row items-center w-full px-4 py-4 hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded'
            >
              <div className='absolute'>{icon}</div>
              <p className='w-full text-center'>Continue with {label}</p>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
