import { clsx } from 'clsx';

import type { NexusCreateRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

type ConfigurationProtectionProps = {
  nexusData: NexusCreateRequestData;
  setNexusData: Dispatch<SetStateAction<NexusCreateRequestData>>;
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
          disabled={nexusData.password === ''}
          className={clsx(
            'px-2 py-0.5 rounded transition-colors',
            nexusData.password === ''
              ? 'bg-gray-100 text-gray-500'
              : 'bg-red-500 focus:bg-red-600 text-white',
          )}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
