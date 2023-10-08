import { Timestamp } from 'firebase/firestore';


import { NexusExpiryType } from '@/types/nexus';

import ConfigurationLinkTypeDynamic from './ConfigurationLinkTypeDynamic';
import ConfigurationLinkTypeStatic from './ConfigurationLinkTypeStatic';

import type { TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

type ConfigurationLinkTypeProps = {
  nexusData: TNexusRequestData;
  setNexusData: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationLinkType({
  nexusData,
  setNexusData,
}: ConfigurationLinkTypeProps): JSX.Element {
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
  }

  return (
    <>
      <fieldset className='flex flex-row w-full'>
        {Object.values(NexusExpiryType).map((expiryType) => (
          <label key={expiryType} className='w-1/3'>
            <input
              type='radio'
              value={expiryType}
              onChange={onNexusExpiryTypeChange}
              checked={nexusData.expiry.type === expiryType}
            />
            {expiryType}
          </label>
        ))}
      </fieldset>
      {nexusData.expiry.type === NexusExpiryType.DYNAMIC && (
        <ConfigurationLinkTypeDynamic setNexusData={setNexusData} />
      )}
      {nexusData.expiry.type === NexusExpiryType.STATIC && (
        <ConfigurationLinkTypeStatic setNexusData={setNexusData} />
      )}
    </>
  );
}
