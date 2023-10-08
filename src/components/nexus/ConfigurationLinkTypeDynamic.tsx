import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import type { NexusExpiryTypeDynamic, TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

function calculateRealValue(
  value: number,
  unit: NexusExpiryDynamicUnit,
): number {
  let unitMultiplier = 0;
  if (unit === NexusExpiryDynamicUnit.MINUTES) {
    unitMultiplier = 60;
  } else if (unit === NexusExpiryDynamicUnit.HOURS) {
    unitMultiplier = 3600;
  } else if (unit === NexusExpiryDynamicUnit.DAYS) {
    unitMultiplier = 86400;
  } else if (unit === NexusExpiryDynamicUnit.MONTHS) {
    unitMultiplier = 2592000;
  }

  return value * unitMultiplier;
}

export enum NexusExpiryDynamicUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
}

type ConfigurationLinkTypeDynamicProps = {
  setNexusData: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationLinkTypeDynamic({
  setNexusData,
}: ConfigurationLinkTypeDynamicProps): JSX.Element {
  const [valueLocal, setValueLocal] = useState<number>(1);
  const [unit, setUnit] = useState<NexusExpiryDynamicUnit>(
    NexusExpiryDynamicUnit.MONTHS,
  );

  useEffect(() => {
    const calculatedValue = calculateRealValue(valueLocal, unit);
    // Set the expiry data
    // While multiplying the value with the unit multiplier
    const expiryData: NexusExpiryTypeDynamic = {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(calculatedValue, 0).toJSON(),
    };

    setNexusData((prev) => {
      return {
        ...prev,
        expiry: { ...expiryData },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueLocal, unit]);

  return (
    <div className='space-y-1'>
      <label htmlFor='link-dynamic-duration' className='block font-semibold'>
        Duration
      </label>
      <div className='flex flex-row w-full space-x-4'>
        <input
          id='link-dynamic-duration'
          type='number'
          placeholder='Expiry'
          value={valueLocal ?? 0}
          onChange={(e): void => setValueLocal(parseInt(e.target.value))}
          className='w-full p-sm rounded appearance-none input-base focus:input-primary'
        />
        <select
          value={unit}
          onChange={(e): void =>
            setUnit(e.target.value as NexusExpiryDynamicUnit)
          }
          className='w-48 h-full p-sm bg-transparent rounded appearance-none input-base focus:input-primary'
        >
          {Object.values(NexusExpiryDynamicUnit).map((unit) => (
            <option key={unit} value={unit} className='capitalize'>
              {unit}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
