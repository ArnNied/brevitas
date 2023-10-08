import { clsx } from 'clsx';
import { useState } from 'react';

import ConfigurationLinkType from './ConfigurationLinkType';
import ConfigurationProtection from './ConfigurationProtection';

import type { TNexusRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction} from 'react';

enum ConfigurationTab {
  TYPE = 'TYPE',
  PROTECTION = 'PROTECTION',
}

const configurationTabs = [
  {
    id: ConfigurationTab.TYPE,
    label: 'Link Type',
  },
  {
    id: ConfigurationTab.PROTECTION,
    label: 'Protection',
  },
];

type NexusCreateConfigurationProps = {
  nexusData: TNexusRequestData;
  setNexusData: Dispatch<SetStateAction<TNexusRequestData>>;
};

export default function HeroNexusCreateConfiguration({
  nexusData,
  setNexusData,
}: NexusCreateConfigurationProps): JSX.Element {
  const [configurationTab, setConfigurationTab] = useState<ConfigurationTab>(
    ConfigurationTab.TYPE,
  );

  return (
    <div className='flex flex-col md:flex-row divide-y md:divide-x md:divide-y-0'>
      <div className='md:w-3/12 space-y-2'>
        {configurationTabs.map(({ id, label }) => (
          <button
            key={id}
            type='button'
            onClick={(): void => setConfigurationTab(id)}
            className={clsx(
              'block w-full p-sm  text-start rounded transition-colors',
              {
                'bg-primary-100 text-primary-600': configurationTab === id,
                'bg-gray-100 hover:bg-gray-200 text-black':
                  configurationTab !== id,
              },
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className='md:w-9/12 pt-4 mt-4 md:pt-0 md:pl-4 md:mt-0 md:ml-4 space-y-4'>
        {configurationTab === ConfigurationTab.TYPE && (
          <ConfigurationLinkType
            nexusData={nexusData}
            setNexusData={setNexusData}
          />
        )}
        {configurationTab === ConfigurationTab.PROTECTION && (
          <ConfigurationProtection
            nexusData={nexusData}
            setNexusData={setNexusData}
          />
        )}
      </div>
    </div>
  );
}
