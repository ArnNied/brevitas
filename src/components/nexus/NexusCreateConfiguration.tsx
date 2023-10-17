import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

import ConfigurationLinkType from './ConfigurationLinkType';
import ConfigurationProtection from './ConfigurationProtection';

import type { NexusCreateRequestData } from '@/types/nexus';
import type { Dispatch, SetStateAction } from 'react';

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
  nexusData: NexusCreateRequestData;
  setNexusData: Dispatch<SetStateAction<NexusCreateRequestData>>;
};

export default function HeroNexusCreateConfiguration({
  nexusData,
  setNexusData,
}: NexusCreateConfigurationProps): JSX.Element {
  return (
    <Tab.Group
      vertical
      as='div'
      className='flex flex-col md:flex-row divide-y md:divide-x md:divide-y-0'
    >
      <Tab.List className='flex flex-col md:w-3/12 space-y-2'>
        {configurationTabs.map(({ id, label }) => (
          <Tab
            key={id}
            className={({ selected }): string =>
              clsx(
                'p-sm text-start rounded focus:outline-none transition-colors',
                {
                  'bg-primary-100 text-primary-700': selected,
                  'bg-gray-100 hover:bg-gray-200': !selected,
                },
              )
            }
          >
            {label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className='md:w-9/12 pt-4 mt-4 md:pt-0 md:pl-4 md:mt-0 md:ml-4'>
        <Tab.Panel>
          <ConfigurationLinkType
            nexusData={nexusData}
            setNexusData={setNexusData}
          />
        </Tab.Panel>
        <Tab.Panel>
          <ConfigurationProtection
            nexusData={nexusData}
            setNexusData={setNexusData}
          />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
