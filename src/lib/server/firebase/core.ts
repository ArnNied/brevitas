import { cert, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import type { App } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? process.env.FIREBASE_SERVICE_ACCOUNT
  : '';

const serviceAccountParsed = JSON.parse(serviceAccount);

function getFirebaseAdmin(): App {
  try {
    return getApp('server');
  } catch (e) {
    return initializeApp(
      {
        credential: cert(serviceAccountParsed),
      },
      'server',
    );
  }
}
export const dbAdmin = getFirestore(getFirebaseAdmin());
export const authAdmin = getAuth(getFirebaseAdmin());
