import type { PlainTimestamp } from './shared';
import type { Timestamp } from 'firebase/firestore';

export enum NexusExpiryType {
  DYNAMIC = 'DYNAMIC',
  STATIC = 'STATIC',
  ENDLESS = 'ENDLESS',
}

export enum NexusStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export type NexusExpiryTypeDynamic = {
  type: NexusExpiryType;
  value: Timestamp | PlainTimestamp;
};

export type NexusExpiryTypeStatic = {
  type: NexusExpiryType;
  start: Timestamp | PlainTimestamp;
  end: Timestamp | PlainTimestamp;
};

export type NexusExpiryTypeEndless = {
  type: NexusExpiryType;
};

export type Nexus = {
  owner: string | null;
  destination: string;
  shortened: string;
  status: NexusStatus;
  expiry:
    | NexusExpiryTypeDynamic
    | NexusExpiryTypeStatic
    | NexusExpiryTypeEndless;
  password: string | null;
  createdAt: Timestamp | PlainTimestamp;
  lastVisited: Timestamp | PlainTimestamp | null;
};

export type NexusCreateRequestData = Pick<
  Nexus,
  'destination' | 'shortened' | 'expiry' | 'password'
>;
