import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { NexusExpiryType } from '@/types/nexus';

import type { NexusExpiryTypeDynamic, TNexus } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';
import NexusFormInputGroup from './NexusFormInputGroup';

export enum NexusExpiryDynamicUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
}

type TExpiryDynamicInputGroupProps = {
  onChange: Dispatch<
    SetStateAction<
      Pick<TNexus, 'shortened' | 'destination' | 'expiry' | 'password'>
    >
  >;
};

export default function ExpiryDynamicInputGroup({
  onChange,
}: TExpiryDynamicInputGroupProps): JSX.Element {
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

    // Reset the expiry type to endless on component unmount as a fallback
    return () => {
      onChange((prev) => {
        return {
          ...prev,
          expiry: {
            type: NexusExpiryType.ENDLESS,
          },
        };
      });
    };
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
    <NexusFormInputGroup label='Duration'>
      <div className='w-full flex flex-row'>
        <input
          type='number'
          placeholder='Expiry'
          value={valueLocal ?? 0}
          onChange={(e): void => onValueChange(e.target.value, unit)}
          className='grow px-2 py-1 border border-gray-500 rounded-tl-lg rounded-bl-lg'
        />
        <select
          onChange={(e): void =>
            onValueChange(
              valueLocal.toString(),
              e.target.value as NexusExpiryDynamicUnit,
            )
          }
        >
          {Object.values(NexusExpiryDynamicUnit).map((unit) => (
            <option key={unit} value={unit} className='capitalize'>
              {unit}
            </option>
          ))}
        </select>
      </div>
    </NexusFormInputGroup>
  );
}
