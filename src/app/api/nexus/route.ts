import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/firebase/firestore';
import { generateString } from '@/lib/utils';
import { NexusExpiryType, NexusStatus } from '@/types/nexus';

import type {
  NexusExpiryTypeDynamic,
  NexusExpiryTypeEndless,
  NexusExpiryTypeStatic,
  TNexus,
  TNexusRequestData,
} from '@/types/nexus';
import type { WithFieldValue } from 'firebase/firestore';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const nexusData: TNexusRequestData = await req.json();

  if (!nexusData.destination) {
    return NextResponse.json(
      { message: 'Missing destination' },
      { status: 400 },
    );
  } else if (typeof nexusData.destination !== 'string') {
    return NextResponse.json(
      { message: 'Invalid destination' },
      { status: 400 },
    );
  } else if (!nexusData.expiry) {
    return NextResponse.json({ message: 'Missing expiry' }, { status: 400 });
  } else if (!nexusData.expiry.type) {
    return NextResponse.json(
      { message: 'Missing expiry type' },
      { status: 400 },
    );
  } else if (!Object.values(NexusExpiryType).includes(nexusData.expiry.type)) {
    return NextResponse.json(
      { message: 'Invalid expiry type' },
      { status: 400 },
    );
  }
  if (nexusData.password && typeof nexusData.password !== 'string') {
    return NextResponse.json({ message: 'Invalid password' }, { status: 400 });
  } else if (
    nexusData.expiry.type === NexusExpiryType.DYNAMIC &&
    !(nexusData.expiry as NexusExpiryTypeDynamic).value
  ) {
    return NextResponse.json(
      { message: 'Missing expiry value' },
      { status: 400 },
    );
  } else if (
    nexusData.expiry.type === NexusExpiryType.STATIC &&
    (!(nexusData.expiry as NexusExpiryTypeStatic).start ||
      !(nexusData.expiry as NexusExpiryTypeStatic).end)
  ) {
    return NextResponse.json(
      {
        message: 'Missing expiry start and/or end',
      },
      { status: 400 },
    );
  }
  // Parse the expiry field according to the expiry type
  // This is mainly to make the expiry field contain Timestamp object
  // instead of PlainTimestamp object
  let parsedExpiry:
    | NexusExpiryTypeDynamic
    | NexusExpiryTypeStatic
    | NexusExpiryTypeEndless;

  if (nexusData.expiry.type === NexusExpiryType.DYNAMIC) {
    const castedExpiry = nexusData.expiry as NexusExpiryTypeDynamic;

    parsedExpiry = {
      type: NexusExpiryType.DYNAMIC,
      value: new Timestamp(
        castedExpiry.value.seconds,
        castedExpiry.value.nanoseconds,
      ),
    };
  } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
    const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

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

  // Create the data object to be saved to the database
  // Prevents unwanted fields from being saved
  // Also as a handy reference for other usage
  const preparedNexusData: WithFieldValue<Omit<TNexus, 'id' | 'owner'>> = {
    destination: nexusData.destination,
    shortened: nexusData.shortened || generateString(6),
    expiry: parsedExpiry,
    status: NexusStatus.ACTIVE,
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    password: nexusData.password || null,
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
        { message: 'Shortened URL already taken' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: 'Error getting document' },
      { status: 500 },
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
            message: 'Nexus successfully created',
            ...nexusNewDocSnap.data(),
          },
          { status: 201 },
        );
      } else {
        return NextResponse.json(
          { message: 'Error creating nexus' },
          { status: 500 },
        );
      }
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { message: 'Error getting the newly made nexus' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: 'Error creating nexus' },
      { status: 500 },
    );
  }
}
