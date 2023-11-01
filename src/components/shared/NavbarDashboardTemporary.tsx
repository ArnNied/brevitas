'use client';

import { signOut } from 'firebase/auth';
import { useState, useCallback } from 'react';

import { auth } from '@/lib/client/firebase/core';
import { constructHeader } from '@/lib/utils';

import { useAuthContext } from '../context/AuthContextProvider';

import { Modal } from './Modal';

import type { ResponseData } from '@/types/shared';

export default function NavbarDashboardTemporary(): JSX.Element {
  const { authUser } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);

  const onClickGenerateApiKey = useCallback(async () => {
    try {
      const req = await fetch('/api/user/generate-api-key', {
        method: 'POST',
        headers: await constructHeader(authUser),
      });
      const res: ResponseData & { key: string } = await req.json();

      console.log(res.key);
    } catch (err) {
      console.error(err);
    }
  }, [authUser]);

  const onClickLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={(): void => setModalOpen(true)}
        className='px-4 py-2 rounded button-primary'
      >
        Dashboard
      </button>
      <Modal
        title='Brevitas'
        subtitle=''
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        primary
      >
        <div className='space-y-2'>
          <button
            onClick={onClickGenerateApiKey}
            className='relative flex flex-row items-center w-full px-4 py-4 hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded'
          >
            <p className='w-full text-center'>Generate Api Key</p>
          </button>
          <button
            onClick={onClickLogout}
            className='relative flex flex-row items-center w-full px-4 py-4 hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded'
          >
            <p className='w-full text-center'>Logout</p>
          </button>
        </div>
      </Modal>
    </>
  );
}
