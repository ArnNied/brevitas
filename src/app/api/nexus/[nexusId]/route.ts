import {
  doc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { nexusCollection } from '@/lib/firebase/firestore';
import { NexusExpiryType, NexusStatus } from '@/types/nexus';

import type {
  NexusExpiryTypeDynamic,
  NexusExpiryTypeStatic,
} from '@/types/nexus';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Grab the nexus ID from the URL
  const nexusId = req.nextUrl.pathname.split('/').pop();

  if (!nexusId) {
    return NextResponse.json({ message: 'Missing nexus ID' }, { status: 400 });
  }

  const nexusDocRef = doc(nexusCollection, nexusId);
  const nexusDocSnap = await getDocFromServer(nexusDocRef);

  if (!nexusDocSnap.exists()) {
    return NextResponse.json({ message: 'Nexus not found' }, { status: 404 });
  }

  const nexusData = nexusDocSnap.data();
  const now = Timestamp.now();

  if (nexusData.status === NexusStatus.INACTIVE) {
    return NextResponse.json({ message: 'Nexus is inactive' }, { status: 401 });
  }

  if (nexusData.expiry.type === NexusExpiryType.DYNAMIC) {
    // Handle dynamic expiry
    const castedExpiry = nexusData.expiry as NexusExpiryTypeDynamic;
    let validUntil: Timestamp;

    if (nexusData.lastVisited === null) {
      validUntil = new Timestamp(
        nexusData.createdAt.seconds + castedExpiry.value.seconds,
        nexusData.createdAt.nanoseconds + castedExpiry.value.nanoseconds,
      );
    } else {
      validUntil = new Timestamp(
        nexusData.lastVisited.seconds + castedExpiry.value.seconds,
        nexusData.lastVisited.nanoseconds + castedExpiry.value.nanoseconds,
      );
    }

    if (now > validUntil) {
      try {
        await updateDoc(nexusDocRef, {
          status: NexusStatus.INACTIVE,
        });

        return NextResponse.json({ message: 'Nexus expired' }, { status: 404 });
      } catch (error) {
        console.log(error);

        return NextResponse.json(
          { message: 'Something went wrong' },
          { status: 500 },
        );
      }
    }
  } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
    // Handle static expiry

    const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

    if (now < castedExpiry.start) {
      const startDate = new Timestamp(
        castedExpiry.start.seconds,
        castedExpiry.start.nanoseconds,
      ).toDate();

      return NextResponse.json(
        {
          message: `Nexus can only be visited starting from ${startDate.toISOString()}`,
        },
        { status: 401 },
      );
    } else if (now > castedExpiry.end) {
      try {
        await updateDoc(nexusDocRef, {
          status: NexusStatus.INACTIVE,
        });

        return NextResponse.json({ message: 'Nexus expired' }, { status: 404 });
      } catch (error) {
        console.log(error);

        return NextResponse.json(
          { message: 'Something went wrong' },
          { status: 500 },
        );
      }
    }
  }

  try {
    await updateDoc(nexusDocRef, {
      lastVisited: serverTimestamp(),
    });

    return NextResponse.json({
      message: 'Nexus visited',
      ...nexusData,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
