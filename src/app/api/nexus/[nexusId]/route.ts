import { compare, hash } from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import {
  getAndValidateNexus,
  getNexus,
  validateNexusData,
} from '@/lib/server/nexus';
import { authenticateUser, formatToPlainTimestamp } from '@/lib/server/utils';
import {
  AuthResponse,
  BasicResponse,
  HTTPStatusCode,
  NexusResponse,
} from '@/types/response';

import type { Nexus } from '@/types/nexus';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const nexusId = req.nextUrl.pathname.split('/').pop() as string;

  const nexusFetchResult = await getAndValidateNexus(nexusId);

  if (!nexusFetchResult.valid) {
    return NextResponse.json(
      { message: nexusFetchResult.message },
      { status: nexusFetchResult.statusCode },
    );
  }

  const { nexusData } = nexusFetchResult;

  if (nexusData.password !== null) {
    return NextResponse.json(
      { message: NexusResponse.PASSWORD_REQUIRED },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  try {
    return NextResponse.json(
      {
        message: NexusResponse.FOUND,
        ...nexusData,
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.UPDATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const nexusId = req.nextUrl.pathname.split('/').pop() as string;

  let requiredNexusData: Pick<Nexus, 'password'>;

  try {
    const reqBody: Pick<Nexus, 'password'> = await req.json();

    requiredNexusData = {
      password: reqBody.password,
    };
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: BasicResponse.BODY_PARSE_ERROR },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }

  const nexusFetchResult = await getAndValidateNexus(nexusId);

  if (!nexusFetchResult.valid) {
    return NextResponse.json(
      { message: nexusFetchResult.message },
      { status: nexusFetchResult.statusCode },
    );
  }

  const { nexusData, nexusDocRef } = nexusFetchResult;

  const validateNexusDataResult = validateNexusData(requiredNexusData);

  if (validateNexusDataResult.error) {
    return NextResponse.json(
      { message: validateNexusDataResult.message },
      { status: validateNexusDataResult.statusCode },
    );
  }

  const validatedNexusData = validateNexusDataResult.nexusData;

  if (nexusData.password !== null) {
    try {
      const passwordMatch = await compare(
        validatedNexusData.password as string,
        nexusData.password,
      );

      if (!passwordMatch) {
        return NextResponse.json(
          { message: NexusResponse.PASSWORD_INCORRECT },
          { status: HTTPStatusCode.UNAUTHORIZED },
        );
      }
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { message: NexusResponse.DECRYPT_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  }

  try {
    const updatedTimestamp = await nexusDocRef.update({
      lastVisited: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        message: NexusResponse.FOUND,
        ...nexusData,
        lastVisited: formatToPlainTimestamp(updatedTimestamp.writeTime),
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.UPDATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const nexusId = req.nextUrl.pathname.split('/').pop() as string;

  const authorizationHeader = req.headers.get('authorization');
  const bearerUid = await authenticateUser(authorizationHeader);

  if (!bearerUid) {
    return NextResponse.json(
      { message: AuthResponse.JWT_OR_API_KEY_INVALID },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  let reqBody: Partial<Nexus>;

  try {
    reqBody = await req.json();
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: BasicResponse.BODY_PARSE_ERROR },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }

  const existingNexus = await getNexus(nexusId);

  if (!existingNexus.exist) {
    return NextResponse.json(
      { message: existingNexus.message },
      { status: existingNexus.statusCode },
    );
  }

  const { nexusData, nexusDocRef } = existingNexus;

  if (nexusData.owner !== bearerUid) {
    return NextResponse.json(
      { message: NexusResponse.NOT_OWNER },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  const validateNexusDataResult = validateNexusData(reqBody, 'UPDATE');

  if (validateNexusDataResult.error) {
    return NextResponse.json(
      { message: validateNexusDataResult.message },
      { status: validateNexusDataResult.statusCode },
    );
  }

  const validatedNexusData = validateNexusDataResult.nexusData;

  // Encrypt the password if it exists
  let encryptedPassword: string | null = null;
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

  try {
    const updatedTimestamp = await nexusDocRef.update({
      ...validatedNexusData,
      password: encryptedPassword ?? nexusData.password,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        message: NexusResponse.UPDATE_SUCCESS,
        // Fill with existing data
        ...nexusData,
        // Overwrite with updated data
        ...validatedNexusData,
        password: encryptedPassword ?? nexusData.password,
        updatedAt: formatToPlainTimestamp(updatedTimestamp.writeTime),
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.UPDATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const nexusId = req.nextUrl.pathname.split('/').pop() as string;

  const authorizationHeader = req.headers.get('authorization');
  const bearerUid = await authenticateUser(authorizationHeader);

  if (!bearerUid) {
    return NextResponse.json(
      { message: AuthResponse.JWT_OR_API_KEY_INVALID },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  const existingNexus = await getNexus(nexusId);

  if (!existingNexus.exist) {
    return NextResponse.json(
      { message: existingNexus.message },
      { status: existingNexus.statusCode },
    );
  }

  const { nexusData, nexusDocRef } = existingNexus;

  if (nexusData.owner !== bearerUid) {
    return NextResponse.json(
      { message: NexusResponse.NOT_OWNER },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  try {
    await nexusDocRef.delete();

    return NextResponse.json(
      { message: NexusResponse.DELETE_SUCCESS },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: NexusResponse.DELETE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
