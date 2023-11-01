import type { PlainTimestamp } from './shared';
import type { Timestamp } from 'firebase-admin/firestore';

export type ApiKey = {
  owner: string;
  key: string;
  createdAt: Timestamp | PlainTimestamp;
  lastUsed: Timestamp | PlainTimestamp | null;
};
