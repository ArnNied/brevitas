import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';
import { HTTPStatusCode } from '@/types/response';

import NexusCreateConfiguration from './NexusCreateConfiguration';

import type { TNexus, NexusCreateRequestData } from '@/types/nexus';
import type { ResponseData } from '@/types/shared';

export default function NexusCreate(): JSX.Element {
  const [nexusData, setNexusData] = useState<NexusCreateRequestData>({
    shortened: '',
    destination: '',
    expiry: {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(0, 0).toJSON(),
    },
    password: '',
  });

  async function onSaveHandler(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();

    try {
      const req = await fetch('/api/nexus', {
        method: 'POST',
        body: JSON.stringify(nexusData),
      });

      if (req.status === HTTPStatusCode.CREATED) {
        const { shortened }: ResponseData & TNexus = await req.json();

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
      // Update the shortened URL input
    } catch (err) {
      console.error(err);
    }
  }

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
            <div className='flex flex-row items-center p-md input-base focus-within:input-primary'>
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
                className='w-full outline-none'
              />
            </div>
          </div>
          <button
            type='submit'
            className='w-full p-md bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded transition-colors'
          >
            Shorten Link
          </button>
        </div>

        <div className='flex flex-row items-center space-x-4'>
          <div className='flex grow h-0.5 bg-gray-300'></div>
          <p className='text-sm text-gray-400 tracking-widest cursor-default'>
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
