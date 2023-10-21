import { Timestamp } from 'firebase/firestore';
import { customAlphabet } from 'nanoid';

export function generateString(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  return customAlphabet(characters, length)();
}

export function timestampNow(nowInMs?: number): Timestamp {
  if (nowInMs) {
    return new Timestamp(Math.floor(nowInMs / 1000), 0);
  } else {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}
