import { hash } from 'bcrypt';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/server/firebase/firestore';
import { getNexus, validateNexusData } from '@/lib/server/nexus';
import { authenticateUser } from '@/lib/server/utils';
import { generateString } from '@/lib/utils';
import { NexusExpiryType, NexusStatus } from '@/types/nexus';
import { HTTPStatusCode, NexusResponse } from '@/types/response';

import type {
  NexusCreateRequestData,
  NexusExpiryTypeDynamic,
  NexusExpiryTypeEndless,
  NexusExpiryTypeStatic,
  Nexus,
} from '@/types/nexus';
import type { WithFieldValue } from 'firebase-admin/firestore';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const bearerToken = req.headers.get('authorization');
  const bearerUid = await authenticateUser(bearerToken);

  const reqBody: NexusCreateRequestData = await req.json();

  const requiredNexusData: Partial<NexusCreateRequestData> = {
    destination: reqBody.destination,
    shortened: reqBody.shortened,
    expiry: reqBody.expiry,
    password: reqBody.password,
  };

  const validatedNexusData = validateNexusData(requiredNexusData);

  if (typeof validatedNexusData === 'string') {
    return NextResponse.json(
      { message: validatedNexusData },
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

  if (validatedNexusData.expiry?.type === NexusExpiryType.DYNAMIC) {
    const castedExpiry = validatedNexusData.expiry as NexusExpiryTypeDynamic;

    parsedExpiry = {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(
        castedExpiry.value.seconds,
        castedExpiry.value.nanoseconds,
      ),
    } as NexusExpiryTypeDynamic;
  } else if (validatedNexusData.expiry?.type === NexusExpiryType.STATIC) {
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
    } as NexusExpiryTypeStatic;
  } else {
    parsedExpiry = {
      type: NexusExpiryType.ENDLESS,
    } as NexusExpiryTypeEndless;
  }

  // Encrypt the password if it exists
  let encryptedPassword = null;
  if (validatedNexusData.password) {
    try {
      encryptedPassword = await hash(validatedNexusData.password, 10);
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { message: NexusResponse.ENCRYPT_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  }

  // Create the data object to be saved to the database
  // Prevents unwanted fields from being saved
  // Also as a handy reference for other usage
  const preparedNexusData: WithFieldValue<Nexus> = {
    owner: bearerUid,
    destination: validatedNexusData.destination as string,
    shortened: validatedNexusData.shortened as string,
    expiry: parsedExpiry,
    status: NexusStatus.ACTIVE,
    password: encryptedPassword,
    createdAt: FieldValue.serverTimestamp(),
    lastVisited: null,
  };

  // Check if the shortened URL is already taken
  try {
    if (preparedNexusData.shortened) {
      const existingNexus = await getNexus(
        preparedNexusData.shortened as string,
      );

      if (existingNexus !== null) {
        return NextResponse.json(
          { message: NexusResponse.SHORTENED_TAKEN },
          { status: HTTPStatusCode.BAD_REQUEST },
        );
      }
    } else {
      let existingNexus = null;
      let randomString = '';

      do {
        randomString = generateString(8);

        existingNexus = await getNexus(randomString);
      } while (existingNexus !== null);

      preparedNexusData.shortened = randomString;
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.DOCUMENT_GET_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    const nexusNewDocRef = await nexusCollection.add(preparedNexusData);

    try {
      const nexusNewDocSnap = await nexusCollection
        .doc(nexusNewDocRef.id)
        .get();

      if (nexusNewDocSnap.exists && nexusNewDocSnap.data()) {
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
      console.error(error);

      return NextResponse.json(
        { message: NexusResponse.NEW_DOCUMENT_GET_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.CREATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
