import sha256 from 'crypto-js/sha256';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { apiKeyCollection } from '@/lib/server/firebase/firestore';
import { authenticateUser } from '@/lib/server/utils';
import { generateString } from '@/lib/utils';
import { AuthResponse, HTTPStatusCode } from '@/types/response';

import type { NextRequest} from 'next/server';


export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('authorization');
  const bearerUid = await authenticateUser(authorizationHeader);

  if (!bearerUid) {
    return NextResponse.json(
      { message: AuthResponse.JWT_INVALID },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  try {
    const generatedKey = generateString(32);
    const hashedKey = sha256(generatedKey).toString();

    const existingApiKeySnap = await apiKeyCollection
      .where('owner', '==', bearerUid)
      .get();

    if (!existingApiKeySnap.empty) {
      const existingApiKey = existingApiKeySnap.docs[0];

      await existingApiKey.ref.update({
        key: hashedKey,
        createdAt: FieldValue.serverTimestamp(),
        lastUsed: null,
      });
    } else {
      await apiKeyCollection.add({
        owner: bearerUid,
        key: hashedKey,
        createdAt: FieldValue.serverTimestamp(),
        lastUsed: null,
      });
    }

    return NextResponse.json(
      {
        message: AuthResponse.API_KEY_CREATE_SUCCESS,
        key: generatedKey,
      },
      { status: HTTPStatusCode.CREATED },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: AuthResponse.API_KEY_CREATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
