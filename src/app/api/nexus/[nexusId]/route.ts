import { compare } from 'bcrypt';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/server/firebase/firestore';
import { getAndValidateNexus, validateNexusData } from '@/lib/server/nexus';
import { HTTPStatusCode, NexusResponse } from '@/types/response';

import type { TNexus } from '@/types/nexus';
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
  const reqData: Pick<TNexus, 'password'> = await req.json();

  const nexusId = req.nextUrl.pathname.split('/').pop();

  const nexusFetchResult = await getAndValidateNexus(nexusId);

  if (!nexusFetchResult.success) {
    return NextResponse.json(
      { message: nexusFetchResult.message },
      { status: nexusFetchResult.statusCode },
    );
  }

  const { nexusData, nexusDocRef } = nexusFetchResult;

  if (nexusData.password !== null) {
    const validatedInputPassword = validateNexusData({
      password: reqData.password,
    });

    if (typeof validatedInputPassword === 'string') {
      return NextResponse.json(
        { message: validatedInputPassword },
        { status: HTTPStatusCode.BAD_REQUEST },
      );
    }

    try {
      const passwordMatch = await compare(
        validatedInputPassword.password as string,
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
        lastVisited: new Timestamp(
          updatedTimestamp.writeTime.seconds,
          updatedTimestamp.writeTime.nanoseconds,
        ),
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
