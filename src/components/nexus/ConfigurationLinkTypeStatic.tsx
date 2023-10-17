import { type Dispatch, type SetStateAction } from 'react';

import ConfigurationLinkTypeStaticInputGroup from './ConfigurationLinkTypeStaticInputGroup';

import type { NexusCreateRequestData } from '@/types/nexus';

type ConfigurationLinkTypeStaticProps = {
  setNexusData: Dispatch<SetStateAction<NexusCreateRequestData>>;
};

export default function ConfigurationLinkTypeStatic({
  setNexusData,
}: ConfigurationLinkTypeStaticProps): JSX.Element {
  return (
    <div className='flex flex-col lg:flex-row space-y-4 lg:space-x-6 lg:space-y-0'>
      <ConfigurationLinkTypeStaticInputGroup
        type='start'
        setNexusData={setNexusData}
      />
      <ConfigurationLinkTypeStaticInputGroup
        type='end'
        setNexusData={setNexusData}
      />
    </div>
  );
}
