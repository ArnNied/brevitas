import { clsx } from 'clsx';

import type { TNexusRequestData } from '@/types/nexus';

type ConfigurationProtectionProps = {
  nexusData: TNexusRequestData;
  setNexusData: React.Dispatch<React.SetStateAction<TNexusRequestData>>;
};

export default function ConfigurationProtection({
  nexusData,
  setNexusData,
}: ConfigurationProtectionProps): JSX.Element {
  return (
    <div className='space-y-1'>
      <label htmlFor='link-password' className='block font-semibold'>
        Password (Optional)
      </label>
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
        className='w-full px-2 py-1 rounded input-base focus:input-primary'
      />
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
