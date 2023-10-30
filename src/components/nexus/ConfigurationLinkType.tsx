'use client';

import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';
import { Timestamp } from 'firebase/firestore';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import ConfigurationLinkTypeDynamic from './ConfigurationLinkTypeDynamic';
import ConfigurationLinkTypeStatic from './ConfigurationLinkTypeStatic';

import type { NexusCreateRequestData } from '@/types/nexus';

type ConfigurationLinkTypeProps = {
  nexusData: NexusCreateRequestData;
  setNexusData: Dispatch<SetStateAction<NexusCreateRequestData>>;
};

export default function ConfigurationLinkType({
  setNexusData,
}: ConfigurationLinkTypeProps): JSX.Element {
  const onNexusExpiryTypeChange = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const value = e.currentTarget.value;

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
            start: new Timestamp(0, 0).toJSON(),
            end: new Timestamp(0, 0).toJSON(),
          },
        }));
      } else if (value === NexusExpiryType.ENDLESS) {
        setNexusData((prev) => ({
          ...prev,
          expiry: { type: NexusExpiryType.ENDLESS },
        }));
      }
    },
    [setNexusData],
  );

  return (
    <Tab.Group>
      <Tab.List className='flex flex-row p-1 bg-gray-100 space-x-1'>
        {Object.values(NexusExpiryType).map((expiryType) => (
          <Tab
            key={expiryType}
            onClick={(e): void => onNexusExpiryTypeChange(e)}
            value={expiryType}
            className={({ selected }): string =>
              clsx(
                'w-full p-md rounded focus:outline-none transition-colors',
                selected
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-transparent hover:bg-gray-200',
              )
            }
          >
            {expiryType}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className='mt-2'>
        <Tab.Panel>
          <ConfigurationLinkTypeDynamic setNexusData={setNexusData} />
        </Tab.Panel>
        <Tab.Panel>
          <ConfigurationLinkTypeStatic setNexusData={setNexusData} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
