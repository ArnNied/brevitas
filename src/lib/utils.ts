import { customAlphabet } from 'nanoid';

import type { User } from 'firebase/auth';

export function generateString(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  return customAlphabet(characters, length)();
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
