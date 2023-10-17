import { hash } from 'bcrypt';
import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/firebase/firestore';
import { validateNexusData } from '@/lib/nexus';
import { generateString } from '@/lib/utils';
import { NexusExpiryType, NexusStatus } from '@/types/nexus';
import { HTTPStatusCode, NexusResponse } from '@/types/response';

import type {
  NexusExpiryTypeDynamic,
  NexusExpiryTypeEndless,
  NexusExpiryTypeStatic,
  TNexus,
  NexusCreateRequestData,
} from '@/types/nexus';
import type { WithFieldValue } from 'firebase/firestore';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const reqData: NexusCreateRequestData = await req.json();

  const validatedNexusData = validateNexusData(reqData);

  if (typeof validatedNexusData !== 'object') {
    return NextResponse.json(
      { message: validateNexusData },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }

  // Parse the expiry field according to the expiry type
  // This is mainly to make the expiry field contain Timestamp object
  // instead of PlainTimestamp object
  let parsedExpiry:
    | NexusExpiryTypeDynamic
    | NexusExpiryTypeStatic
    | NexusExpiryTypeEndless;

  if (validatedNexusData.expiry.type === NexusExpiryType.DYNAMIC) {
    const castedExpiry = validatedNexusData.expiry as NexusExpiryTypeDynamic;

    parsedExpiry = {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(
        castedExpiry.value.seconds,
        castedExpiry.value.nanoseconds,
      ),
    };
  } else if (validatedNexusData.expiry.type === NexusExpiryType.STATIC) {
    const castedExpiry = validatedNexusData.expiry as NexusExpiryTypeStatic;

    parsedExpiry = {
      type: NexusExpiryType.STATIC,
      start: new Timestamp(
        castedExpiry.start.seconds,
        castedExpiry.start.nanoseconds,
      ),
      end: new Timestamp(
        castedExpiry.end.seconds,
        castedExpiry.end.nanoseconds,
      ),
    };
  } else {
    parsedExpiry = {
      type: NexusExpiryType.ENDLESS,
    };
  }

  // Encrypt the password if it exists
  let encryptedPassword = null;
  if (validatedNexusData.password) {
    try {
      encryptedPassword = await hash(validatedNexusData.password, 10);
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: NexusResponse.ENCRYPT_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  }

  // Create the data object to be saved to the database
  // Prevents unwanted fields from being saved
  // Also as a handy reference for other usage
  const preparedNexusData: WithFieldValue<Omit<TNexus, 'id' | 'owner'>> = {
    destination: validatedNexusData.destination,
    shortened: validatedNexusData.shortened || generateString(6),
    expiry: parsedExpiry,
    status: NexusStatus.ACTIVE,
    password: encryptedPassword,
    createdAt: serverTimestamp(),
    lastVisited: null,
  };

  // Check if the shortened URL is already taken
  try {
    const existingDocRef = await getDocFromServer(
      doc(nexusCollection, preparedNexusData.shortened as string),
    );

    if (existingDocRef.exists()) {
      return NextResponse.json(
        { message: NexusResponse.SHORTENED_TAKEN },
        { status: HTTPStatusCode.BAD_REQUEST },
      );
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: NexusResponse.DOCUMENT_GET_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    const nexusNewDocRef = doc(
      nexusCollection,
      preparedNexusData.shortened as string,
    );
    await setDoc(nexusNewDocRef, preparedNexusData);

    try {
      const nexusNewDocSnap = await getDocFromServer(nexusNewDocRef);

      if (nexusNewDocSnap.exists() && nexusNewDocSnap.data()) {
        return NextResponse.json(
          {
            message: NexusResponse.CREATE_SUCCESS,
            ...nexusNewDocSnap.data(),
          },
          { status: HTTPStatusCode.CREATED },
        );
      } else {
        return NextResponse.json(
          { message: NexusResponse.CREATE_ERROR },
          { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
        );
      }
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: NexusResponse.NEW_DOCUMENT_GET_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: NexusResponse.CREATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
