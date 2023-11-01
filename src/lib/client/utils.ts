import { PlainTimestamp } from '@/types/shared';
import { Timestamp } from 'firebase/firestore';

export function signInMode(
  action: 'GET' | 'SET' | 'DELETE',
  value?: 'redirect' | 'popup',
): 'redirect' | 'popup' {
  const key = 'signInMode';

  if (action === 'SET') {
    window.localStorage.setItem(key, value as string);

    return value as 'redirect' | 'popup';
  } else if (action === 'DELETE') {
    window.localStorage.removeItem(key);

    return 'redirect';
  } else {
    const item = window.localStorage.getItem(key);

    return item ? (item as 'redirect' | 'popup') : 'redirect';
  }
}

export function formatToPlainTimestamp(
  timestamp: Timestamp | PlainTimestamp,
): PlainTimestamp {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  };
}

export function formatToTimestamp(
  plainTimestamp: Timestamp | PlainTimestamp,
): Timestamp {
  return new Timestamp(plainTimestamp.seconds, plainTimestamp.nanoseconds);
}
