import { clsx } from 'clsx';

import type { TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';


type ConfigurationProtectionProps = {
  nexusData: TNexusRequestData;
  setNexusData: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationProtection({
  nexusData,
  setNexusData,
}: ConfigurationProtectionProps): JSX.Element {
  return (
    <div className='space-y-1'>
      <label>
        <span className='block font-semibold'>Password (Optional)</span>
        <input
          id='link-password'
          type='password'
          value={nexusData.password ?? ''}
          onChange={(e): void =>
            setNexusData((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
          className='w-full p-sm rounded input-base focus:input-primary'
        />
      </label>

      <div className='flex flex-row justify-end'>
        <button
          type='button'
          onClick={(): void => {
            setNexusData((prev) => ({
              ...prev,
              password: '',
            }));
          }}
          className={clsx('px-2 py-0.5 rounded transition-colors', {
            'bg-red-500 focus:bg-red-600 text-white': nexusData.password !== '',
            'bg-gray-100 text-gray-500': nexusData.password === '',
          })}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
