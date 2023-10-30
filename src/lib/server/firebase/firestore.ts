import { genericFirestoreDataConverter } from './converter';
import { dbAdmin } from './core';

import type { ApiKey } from '@/types/apiKey';
import type { Nexus } from '@/types/nexus';

export const nexusConverter = genericFirestoreDataConverter<Nexus>();
export const nexusCollection = dbAdmin
  .collection('nexus')
  .withConverter(nexusConverter);

export const apiKeyConverter = genericFirestoreDataConverter<ApiKey>();
export const apiKeyCollection = dbAdmin
  .collection('apiKeys')
  .withConverter(apiKeyConverter);
