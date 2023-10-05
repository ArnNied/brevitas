import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import type { NexusExpiryTypeDynamic, TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

export enum NexusExpiryDynamicUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
}

type ConfigurationLinkTypeDynamicProps = {
  onChange: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationLinkTypeDynamic({
  onChange,
}: ConfigurationLinkTypeDynamicProps): JSX.Element {
  const [valueLocal, setValueLocal] = useState<number>(0);
  const [unit, setUnit] = useState<NexusExpiryDynamicUnit>(
    NexusExpiryDynamicUnit.MINUTES,
  );

  useEffect(() => {
    // Set initial values on component mount
    onChange((prev) => {
      return {
        ...prev,
        expiry: {
          type: NexusExpiryType.DYNAMIC,
          value: new Timestamp(0, 0).toJSON(),
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onValueChange(value: string, unit: NexusExpiryDynamicUnit): void {
    // Set the local state
    setValueLocal(parseInt(value));
    setUnit(unit);

    // Set a multiplier based on the unit
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

    // Set the expiry data
    // While multiplying the value with the unit multiplier
    const expiryData: NexusExpiryTypeDynamic = {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(parseInt(value) * unitMultiplier, 0).toJSON(),
    };

    onChange((prev) => {
      return {
        ...prev,
        expiry: { ...expiryData },
      };
    });
  }

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
          onChange={(e): void => onValueChange(e.target.value, unit)}
          className='w-full px-2 py-1 rounded appearance-none input-base focus:input-primary'
        />
        <select
          onChange={(e): void =>
            onValueChange(
              valueLocal.toString(),
              e.target.value as NexusExpiryDynamicUnit,
            )
          }
          className='w-48 h-full px-2 py-1 bg-transparent rounded appearance-none input-base focus:input-primary'
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
