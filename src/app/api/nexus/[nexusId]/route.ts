import { compare } from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { getAndValidateNexus, validateNexusData } from '@/lib/server/nexus';
import { formatToPlainTimestamp } from '@/lib/server/utils';
import { BasicResponse, HTTPStatusCode, NexusResponse } from '@/types/response';

import type { Nexus, NexusCreateRequestData } from '@/types/nexus';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Grab the nexus ID from the URL
  const nexusId = req.nextUrl.pathname.split('/').pop();

  const nexusFetchResult = await getAndValidateNexus(nexusId);

  if (!nexusFetchResult.success) {
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
  const nexusId = req.nextUrl.pathname.split('/').pop();

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

  const validatedNexusData = validateNexusData(requiredNexusData);

  if (typeof validatedNexusData === 'string') {
    return NextResponse.json(
      { message: validatedNexusData },
      { status: HTTPStatusCode.BAD_REQUEST },
    );
  }

  const nexusFetchResult = await getAndValidateNexus(nexusId);

  if (!nexusFetchResult.success) {
    return NextResponse.json(
      { message: nexusFetchResult.message },
      { status: nexusFetchResult.statusCode },
    );
  }

  const { nexusData, nexusDocRef } = nexusFetchResult;

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
