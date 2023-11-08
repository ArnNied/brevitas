'use client';

import { Timestamp } from 'firebase/firestore';
import { useCallback, useState } from 'react';

import { constructHeader } from '@/lib/utils';
import { NexusExpiryType } from '@/types/nexus';
import { HTTPStatusCode } from '@/types/response';

import { useAuthContext } from '../context/AuthContextProvider';

import NexusCreateConfiguration from './NexusCreateConfiguration';

import type { Nexus, NexusCreateRequestData } from '@/types/nexus';
import type { ResponseData } from '@/types/shared';

export default function NexusCreate(): JSX.Element {
  const { authUser } = useAuthContext();

  const [nexusData, setNexusData] = useState<NexusCreateRequestData>({
    shortened: '',
    destination: '',
    expiry: {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(0, 0).toJSON(),
    },
    password: '',
  });

  const onSaveHandler = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      try {
        const req = await fetch('/api/nexus', {
          method: 'POST',
          headers: await constructHeader(authUser),
          body: JSON.stringify({ ...nexusData }),
        });

        if (req.status === HTTPStatusCode.CREATED) {
          const { shortened }: ResponseData & Nexus = await req.json();

          // Update the shortened URL input
          setNexusData((prev) => {
            return {
              ...prev,
              shortened: shortened,
            };
          });
        } else {
          const { message }: ResponseData = await req.json();

          alert(`${req.status} ${req.statusText}: ${message}`);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [authUser, nexusData],
  );

  return (
    <div className='p-8 bg-white rounded shadow-md shadow-primary/20'>
      <form
        onSubmit={onSaveHandler}
        className='flex flex-col space-y-2 md:space-y-4'
      >
        <div className='flex flex-col items-center space-y-2'>
          <label className='w-full space-y-1'>
            <span className='block font-semibold'>Your Long URL</span>
            <input
              id='link-long'
              type='text'
              placeholder='https://example.com/very-long-url'
              value={nexusData.destination}
              onChange={(e): void =>
                setNexusData((prev) => ({
                  ...prev,
                  destination: e.target.value,
                }))
              }
              className='w-full p-md input-base focus:input-primary'
            />
          </label>
          <div className='w-full space-y-1'>
            <label htmlFor='link-shortened' className='block font-semibold'>
              Your Shortened URL
            </label>
            <div className='flex flex-row items-center px-3 input-base focus-within:input-primary'>
              <span className=''>https://brev.id/</span>
              <input
                id='link-shortened'
                type='text'
                placeholder='shortened-url'
                value={nexusData.shortened}
                onChange={(e): void =>
                  setNexusData((prev) => ({
                    ...prev,
                    shortened: e.target.value,
                  }))
                }
                onClick={(e): void => e.currentTarget.select()}
                onCopy={(e): void => {
                  e.preventDefault();

                  navigator.clipboard.writeText(
                    `${window.location.origin}/${e.currentTarget.value}`,
                  );
                }}
                className='w-full py-2 outline-none'
              />
            </div>
          </div>
          <button
            type='submit'
            className='w-full p-md font-semibold rounded button-primary'
          >
            Shorten Link
          </button>
        </div>

        <div className='flex flex-row items-center'>
          <div className='flex grow h-0.5 bg-gray-300'></div>
          <p className='mx-2 text-sm text-gray-400 tracking-widest cursor-default'>
            CONFIGURATION
          </p>
          <div className='flex grow h-0.5 bg-gray-300'></div>
        </div>

        <NexusCreateConfiguration
          nexusData={nexusData}
          setNexusData={setNexusData}
        />
      </form>
    </div>
  );
}
