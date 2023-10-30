import { Timestamp } from 'firebase/firestore';

export function timestampNow(nowInMs?: number): Timestamp {
  if (nowInMs) {
    return new Timestamp(Math.floor(nowInMs / 1000), 0);
  } else {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}

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
