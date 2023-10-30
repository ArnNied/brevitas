import sha256 from 'crypto-js/sha256';
import { Timestamp } from 'firebase-admin/firestore';

import { authAdmin } from './firebase/core';
import { apiKeyCollection } from './firebase/firestore';

export function timestampNow(nowInMs?: number): Timestamp {
  if (nowInMs) {
    return new Timestamp(Math.floor(nowInMs / 1000), 0);
  } else {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
}

export async function authenticateUser(
  authorizationHeader: string | null | undefined,
): Promise<string | null> {
  // Check if authorization header is present
  if (!authorizationHeader) return null;

  // Remove the "Bearer " prefix from the authorization header
  const token = authorizationHeader.split(' ')[1];

  if (token.includes('.')) {
    // Check if token is JWT and then decode
    try {
      const decoded = await authAdmin.verifyIdToken(token);

      return decoded.uid;
    } catch (error) {
      console.error(error);

      return null;
    }
  } else {
    // Check if token is an API key and then validate
    const hashedToken = sha256(token).toString();
    const bearer = await apiKeyCollection.where('key', '==', hashedToken).get();

    if (!bearer.empty) {
      return bearer.docs[0].data().owner;
    } else {
      return null;
    }
  }
}
