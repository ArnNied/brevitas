import { Timestamp } from 'firebase-admin/firestore';

export function timestampNow(nowInMs?: number): Timestamp {
  if (nowInMs) {
    return new Timestamp(Math.floor(nowInMs / 1000), 0);
  } else {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}
