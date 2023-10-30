import { genericFirestoreDataConverter } from './converter';
import { dbAdmin } from './core';

import type { TNexus } from '@/types/nexus';

export const nexusConverter = genericFirestoreDataConverter<TNexus>();
export const nexusCollection = dbAdmin
  .collection('nexus')
  .withConverter(nexusConverter);
