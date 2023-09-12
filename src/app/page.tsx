'use client';

import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';

import ExpiryDynamicInputGroup from '@/components/nexus/ExpiryDynamicInputGroup';
import ExpiryStaticInputGroup from '@/components/nexus/ExpiryStaticInputGroup';
import { NexusExpiryType } from '@/types/nexus';

import type { TNexus, TNexusRequestData } from '@/types/nexus';
import NexusFormInputGroup from '@/components/nexus/NexusFormInputGroup';
import { ResponseData } from '@/types/shared';

export default function Home(): JSX.Element {
  const [nexusData, setNexusData] = useState<TNexusRequestData>({
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

      if (req.status === 201) {
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

  function onNexusExpiryTypeChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const value = e.target.value as NexusExpiryType;

    if (value === NexusExpiryType.DYNAMIC) {
      setNexusData((prev) => ({
        ...prev,
        expiry: {
          type: NexusExpiryType.DYNAMIC,
          value: new Timestamp(0, 0).toJSON(),
        },
      }));
    } else if (value === NexusExpiryType.STATIC) {
      setNexusData((prev) => ({
        ...prev,
        expiry: {
          type: NexusExpiryType.STATIC,
          start: new Timestamp(0, 0),
          end: new Timestamp(0, 0),
        },
      }));
    } else if (value === NexusExpiryType.ENDLESS) {
      setNexusData((prev) => ({
        ...prev,
        expiry: { type: NexusExpiryType.ENDLESS },
      }));
    }
  }

  return (
    <div className='p-8 border border-gray-500 rounded-lg centered max-w-screen-lg w-full'>
      <form
        onSubmit={onSaveHandler}
        className='flex flex-col space-y-2 lg:space-y-4'
      >
        <div className='flex flex-col lg:flex-row items-center lg:space-x-4 space-y-2 lg:space-y-0'>
          <NexusFormInputGroup label='Your Long URL'>
            <input
              type='text'
              placeholder='https://example.com/very-long-url'
              value={nexusData.destination}
              onChange={(e): void =>
                setNexusData((prev) => ({
                  ...prev,
                  destination: e.target.value,
                }))
              }
              className='w-full px-2 py-1 border border-gray-500 rounded-lg'
            />
          </NexusFormInputGroup>
          <NexusFormInputGroup label='Your Shortened URL'>
            <div className='flex flex-row items-center lg:space-x-4'>
              <span className='mr-2'>https://brev.id/</span>
              <input
                type='text'
                placeholder='shortened'
                value={nexusData.shortened}
                onChange={(e): void => {
                  setNexusData((prev) => ({
                    ...prev,
                    shortened: e.target.value,
                  }));
                }}
                className='w-full px-2 py-1 border border-gray-500 rounded-lg'
              />
              <button
                onClick={(): void => {
                  navigator.clipboard.writeText(
                    'https://brev.id/' + nexusData.shortened,
                  );
                  alert('Copied to clipboard');
                }}
                className='ml-2'
              >
                Copy
              </button>
            </div>
          </NexusFormInputGroup>
        </div>

        <div className='flex flex-col lg:flex-row items-center lg:space-x-4 space-y-2 lg:space-y-0'>
          <NexusFormInputGroup label='Type'>
            <div className='flex flex-row justify-around'>
              {Object.values(NexusExpiryType).map((expiryType) => (
                <div key={expiryType}>
                  <label>
                    <input
                      type='radio'
                      value={expiryType}
                      onChange={onNexusExpiryTypeChange}
                      checked={nexusData.expiry.type === expiryType}
                    />
                    {expiryType}
                  </label>
                </div>
              ))}
            </div>
          </NexusFormInputGroup>
          {nexusData.expiry.type === NexusExpiryType.STATIC && (
            <ExpiryStaticInputGroup onChange={setNexusData} />
          )}
          {nexusData.expiry.type === NexusExpiryType.DYNAMIC && (
            <ExpiryDynamicInputGroup onChange={setNexusData} />
          )}
        </div>
        <div className='flex flex-col lg:flex-row items-end lg:space-x-4 space-y-2 lg:space-y-0'>
          <NexusFormInputGroup label='Password (Optional)'>
            <input
              type='password'
              className='w-full px-2 py-1 border border-gray-500 rounded-lg'
            />
          </NexusFormInputGroup>
          <NexusFormInputGroup label='Submit'>
            <button
              type='submit'
              className='w-full px-2 py-1 border border-gray-500 rounded-lg'
            >
              Save
            </button>
          </NexusFormInputGroup>
        </div>
      </form>
    </div>
  );
}
