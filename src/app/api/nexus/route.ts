import { hash } from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/server/firebase/firestore';
import { getNexus, validateNexusData } from '@/lib/server/nexus';
import { authenticateUser } from '@/lib/server/utils';
import { generateString } from '@/lib/utils';
import { NexusStatus } from '@/types/nexus';
import {
  AuthResponse,
  BasicResponse,
  HTTPStatusCode,
  NexusResponse,
} from '@/types/response';

import type { NexusCreateRequestData, Nexus, NexusExpiry } from '@/types/nexus';
import type { WithFieldValue } from 'firebase-admin/firestore';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('authorization');
  const bearerUid = await authenticateUser(authorizationHeader);

  if (!bearerUid) {
    return NextResponse.json(
      { message: AuthResponse.JWT_OR_API_KEY_INVALID },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  try {
    const listOfNexusOwnedByUserSnap = await nexusCollection
      .where('owner', '==', bearerUid)
      .get();

    const listOfNexusOwnedByUser = listOfNexusOwnedByUserSnap.docs.map((doc) =>
      doc.data(),
    );

    return NextResponse.json(
      {
        message: NexusResponse.FOUND,
        data: listOfNexusOwnedByUser,
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.DOCUMENT_GET_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('authorization');
  const bearerUid = await authenticateUser(authorizationHeader);

  let requiredNexusData: NexusCreateRequestData;

  try {
    const reqBody: NexusCreateRequestData = await req.json();

    requiredNexusData = {
      destination: reqBody.destination,
      shortened: reqBody.shortened,
      expiry: reqBody.expiry,
      password: reqBody.password,
    };
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: BasicResponse.BODY_PARSE_ERROR },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }

  const validateNexusDataResult = validateNexusData(requiredNexusData);

  if (validateNexusDataResult.error) {
    return NextResponse.json(
      { message: validateNexusDataResult.message },
      { status: validateNexusDataResult.statusCode },
    );
  }

  const validatedNexusData = validateNexusDataResult.nexusData;

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
    expiry: validatedNexusData.expiry as NexusExpiry,
    status: NexusStatus.ACTIVE,
    password: encryptedPassword,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: null,
    lastVisited: null,
  };

  // Check if the shortened URL is already taken
  try {
    if (preparedNexusData.shortened) {
      const existingNexus = await getNexus(
        preparedNexusData.shortened as string,
      );

      if (existingNexus.exist) {
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
      } while (existingNexus.exist);

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
