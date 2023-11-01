import { Timestamp } from 'firebase/firestore';
import { customAlphabet } from 'nanoid';

import type { PlainTimestamp } from '@/types/shared';
import type { User } from 'firebase/auth';

export function generateString(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  return customAlphabet(characters, length)();
}

export function timestampNow(unixTimestampMs?: number): Timestamp {
  if (unixTimestampMs) {
    return new Timestamp(Math.floor(unixTimestampMs / 1000), 0);
  } else {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}

export function hasOwnProperty<X extends object, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export async function constructHeader(user: User | null): Promise<Headers> {
  const headers = new Headers();

  headers.append('Content-Type', 'application/json');

  if (user) {
    const token = await user.getIdToken();

    headers.append('Authorization', `Bearer ${token}`);
  }

  return headers;
}
