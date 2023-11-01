import sha256 from 'crypto-js/sha256';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { authAdmin } from './firebase/core';
import { apiKeyCollection } from './firebase/firestore';
import { PlainTimestamp } from '@/types/shared';

export async function authenticateUser(
  authorizationHeader: string | null | undefined,
): Promise<string | null> {
  // Check if authorization header is present
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

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
    try {
      const hashedToken = sha256(token).toString();
      const bearerSnap = await apiKeyCollection
        .where('key', '==', hashedToken)
        .get();

      if (!bearerSnap.empty) {
        const bearer = bearerSnap.docs[0];

        bearer.ref.update({
          lastUsed: FieldValue.serverTimestamp(),
        });

        return bearer.data().owner;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);

      return null;
    }
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
