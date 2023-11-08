import {
  WithFieldValue,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  PartialWithFieldValue,
} from 'firebase-admin/firestore';

import { formatToPlainTimestamp, formatToTimestamp } from '@/lib/server/utils';
import { NexusExpiryType } from '@/types/nexus';

import type { ApiKey } from '@/types/apiKey';
import type {
  Nexus,
  NexusExpiryTypeDynamic,
  NexusExpiryTypeEndless,
  NexusExpiryTypeStatic,
} from '@/types/nexus';

export function genericFirestoreDataConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore(item: T): DocumentData {
      return item as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as T & { id: string };
    },
  };
}

export const nexusConverter: FirestoreDataConverter<Nexus> = {
  toFirestore(item: Nexus): DocumentData {
    let parsedExpiry:
      | NexusExpiryTypeDynamic
      | NexusExpiryTypeStatic
      | NexusExpiryTypeEndless;

    switch (item.expiry.type) {
      case NexusExpiryType.DYNAMIC: {
        const castedExpiry = item.expiry as NexusExpiryTypeDynamic;

        parsedExpiry = {
          type: NexusExpiryType.DYNAMIC,
          value: formatToTimestamp(castedExpiry.value),
        } as NexusExpiryTypeDynamic;
        break;
      }

      case NexusExpiryType.STATIC: {
        const castedExpiry = item.expiry as NexusExpiryTypeStatic;

        parsedExpiry = {
          type: NexusExpiryType.STATIC,
          start: formatToTimestamp(castedExpiry.start),
          end: formatToTimestamp(castedExpiry.end),
        } as NexusExpiryTypeStatic;
        break;
      }

      default: {
        parsedExpiry = {
          type: NexusExpiryType.ENDLESS,
        } as NexusExpiryTypeEndless;
      }
    }

    const parsedItem: Omit<Nexus, 'id'> = {
      ...item,
      expiry: parsedExpiry,
    };

    return parsedItem as DocumentData;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Nexus {
    const data = snapshot.data() as Nexus;

    let parsedExpiry:
      | NexusExpiryTypeDynamic
      | NexusExpiryTypeStatic
      | NexusExpiryTypeEndless;

    switch (data.expiry.type) {
      case NexusExpiryType.DYNAMIC: {
        const castedExpiry = data.expiry as NexusExpiryTypeDynamic;

        parsedExpiry = {
          type: NexusExpiryType.DYNAMIC,
          value: formatToPlainTimestamp(castedExpiry.value),
        } as NexusExpiryTypeDynamic;
        break;
      }

      case NexusExpiryType.STATIC: {
        const castedExpiry = data.expiry as NexusExpiryTypeStatic;

        parsedExpiry = {
          type: NexusExpiryType.STATIC,
          start: formatToPlainTimestamp(castedExpiry.start),
          end: formatToPlainTimestamp(castedExpiry.end),
        } as NexusExpiryTypeStatic;
        break;
      }

      default: {
        parsedExpiry = {
          type: NexusExpiryType.ENDLESS,
        } as NexusExpiryTypeEndless;
      }
    }

    return {
      id: snapshot.id,
      owner: data.owner,
      destination: data.destination,
      shortened: data.shortened,
      status: data.status,
      password: data.password,
      expiry: parsedExpiry,
      lastVisited: data.lastVisited
        ? formatToPlainTimestamp(data.lastVisited)
        : null,
      createdAt: formatToPlainTimestamp(data.createdAt),
      updatedAt: data.updatedAt ? formatToPlainTimestamp(data.updatedAt) : null,
    } as Nexus & { id: string };
  },
};

export const apiKeyConverter: FirestoreDataConverter<ApiKey> = {
  toFirestore(item: ApiKey): DocumentData {
    return item as DocumentData;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): ApiKey {
    const data = snapshot.data() as ApiKey;

    return {
      id: snapshot.id,
      owner: data.owner,
      key: data.key,
      lastUsed: data.lastUsed ? formatToPlainTimestamp(data.lastUsed) : null,
      createdAt: formatToPlainTimestamp(data.createdAt),
    } as ApiKey & { id: string };
  },
};
