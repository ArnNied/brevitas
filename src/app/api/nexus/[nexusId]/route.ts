import { compare } from 'bcrypt';
import { serverTimestamp, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { getAndValidateNexus } from '@/lib/nexus';
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

  const { nexusData, nexusDocRef } = nexusFetchResult;

  if (nexusData.password !== null) {
    return NextResponse.json(
      { message: NexusResponse.PASSWORD_REQUIRED },
      { status: HTTPStatusCode.UNAUTHORIZED },
    );
  }

  try {
    await updateDoc(nexusDocRef, {
      lastVisited: serverTimestamp(),
    });

    return NextResponse.json(
      {
        message: NexusResponse.FOUND,
        ...nexusData,
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.log(error);

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
    if (!reqData.password) {
      return NextResponse.json(
        { message: NexusResponse.PASSWORD_MISSING },
        { status: HTTPStatusCode.BAD_REQUEST },
      );
    } else if (typeof reqData.password !== 'string') {
      return NextResponse.json(
        { message: NexusResponse.PASSWORD_INVALID },
        { status: HTTPStatusCode.BAD_REQUEST },
      );
    }

    try {
      const passwordMatch = await compare(reqData.password, nexusData.password);

      if (!passwordMatch) {
        return NextResponse.json(
          { message: NexusResponse.PASSWORD_INCORRECT },
          { status: HTTPStatusCode.UNAUTHORIZED },
        );
      }
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: NexusResponse.DECRYPT_ERROR },
        { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
      );
    }
  }

  try {
    await updateDoc(nexusDocRef, {
      lastVisited: serverTimestamp(),
    });

    return NextResponse.json(
      {
        message: NexusResponse.FOUND,
        ...nexusData,
      },
      { status: HTTPStatusCode.OK },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: NexusResponse.UPDATE_ERROR },
      { status: HTTPStatusCode.INTERNAL_SERVER_ERROR },
    );
  }
}
