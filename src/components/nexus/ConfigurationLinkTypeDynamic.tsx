import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import CustomSelect from '../shared/CustomSelect';

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
  const [selectedUnit, setSelectedUnit] = useState<NexusExpiryDynamicUnit>(
    NexusExpiryDynamicUnit.MONTHS,
  );

  useEffect(() => {
    const calculatedValue = calculateRealValue(valueLocal, selectedUnit);
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
  }, [valueLocal, selectedUnit]);

  return (
    <div className='space-y-2'>
      <label
        htmlFor='link-configuration-dynamic-value'
        className='block font-semibold'
      >
        Duration
      </label>
      <div className='flex flex-row w-full space-x-4'>
        <input
          id='link-configuration-dynamic-value'
          type='number'
          placeholder='Expiry'
          value={valueLocal ?? 0}
          onChange={(e): void => setValueLocal(parseInt(e.target.value))}
          className='w-full p-md rounded appearance-none input-base focus:input-primary'
        />
        <CustomSelect
          value={selectedUnit}
          setValue={setSelectedUnit}
          values={Object.values(NexusExpiryDynamicUnit)}
          width='w-36'
        />
      </div>
    </div>
  );
}
