'use client';

import { Transition, Dialog } from '@headlessui/react';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithRedirect,
  getAdditionalUserInfo,
  getRedirectResult,
  signInWithPopup,
} from 'firebase/auth';
import { useState, Fragment, useCallback, useEffect } from 'react';
import { AiFillGithub, AiOutlineClose } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';

import { auth } from '@/lib/client/firebase/core';
import { signInMode } from '@/lib/client/utils';

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

export default function NavbarLogin(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSignInWithProvider = useCallback(
    async (provider: GoogleAuthProvider | GithubAuthProvider) => {
      if (signInMode('GET') === 'redirect') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (err) {
          console.error(err);
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
        className='px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors'
      >
        Get Started
      </button>
      {/* MODAL */}
      <Transition show={modalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          onClose={(): void => setModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25 backdrop-blur-[2px]' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <button
                    onClick={(): void => setModalOpen(false)}
                    className='absolute top-0 right-0 m-4'
                  >
                    <AiOutlineClose size={25} />
                  </button>
                  <header>
                    <Dialog.Title
                      as='h3'
                      className='w-fit mx-auto text-4xl font-bold text-gradient'
                    >
                      Brevitas
                    </Dialog.Title>
                    <Dialog.Description className='mt-1 mb-4 text-center text-gray-500'>
                      Please select an authentication method
                    </Dialog.Description>
                  </header>
                  <div className='space-y-2'>
                    {Providers.map(({ label, provider, icon }) => (
                      <button
                        key={label}
                        onClick={(): Promise<void> =>
                          handleSignInWithProvider(provider)
                        }
                        className='relative flex flex-row items-center w-full px-4 py-4 hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded'
                      >
                        <div className='absolute'>{icon}</div>
                        <p className='w-full text-center'>
                          Continue with {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
