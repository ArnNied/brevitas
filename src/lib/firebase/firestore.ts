import { collection } from 'firebase/firestore';

import { genericFirestoreDataConverter } from './converter';
import { db } from './core';

import type { TNexus } from '@/types/nexus';

export const nexusCollection = collection(db, 'nexus').withConverter(
  genericFirestoreDataConverter<TNexus>(),
);
