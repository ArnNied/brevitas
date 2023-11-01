import { Timestamp } from 'firebase-admin/firestore';

import { timestampNow, hasOwnProperty } from '@/lib/utils';
import { NexusExpiryType, NexusStatus } from '@/types/nexus';
import { HTTPStatusCode, NexusResponse } from '@/types/response';

import { nexusCollection } from './firebase/firestore';

import type {
  NexusExpiryTypeDynamic,
  NexusExpiryTypeStatic,
  Nexus,
} from '@/types/nexus';
import type { DocumentReference } from 'firebase-admin/firestore';

export function validateNexusData(
  nexusData: Partial<Nexus>,
  prune: boolean = false,
): Partial<Nexus> | NexusResponse {
  if (prune) {
    Object.keys(nexusData).forEach((key) => {
      if (nexusData[key as keyof Nexus] === undefined) {
        delete nexusData[key as keyof Nexus];
      }
    });
  }

  if (hasOwnProperty(nexusData, 'destination')) {
    if (typeof nexusData.destination !== 'string') {
      return NexusResponse.DESTINATION_INVALID;
    } else if (nexusData.destination.length <= 0) {
      return NexusResponse.DESTINATION_MISSING;
    }
  }

  if (hasOwnProperty(nexusData, 'shortened')) {
    if (typeof nexusData.shortened !== 'string') {
      return NexusResponse.SHORTENED_INVALID;
    }
  }

  if (hasOwnProperty(nexusData, 'status')) {
    if (
      typeof nexusData.status !== 'string' ||
      !Object.values(NexusStatus).includes(nexusData.status as NexusStatus)
    ) {
      return NexusResponse.STATUS_INVALID;
    }
  }

  if (hasOwnProperty(nexusData, 'expiry')) {
    if (typeof nexusData.expiry !== 'object') {
      return NexusResponse.EXPIRY_INVALID;
    }

    if (
      typeof nexusData.expiry.type !== 'string' ||
      !Object.values(NexusExpiryType).includes(nexusData.expiry.type)
    ) {
      return NexusResponse.EXPIRY_TYPE_INVALID;
    }

    if (nexusData.expiry.type === NexusExpiryType.DYNAMIC) {
      const castedExpiry = nexusData.expiry as NexusExpiryTypeDynamic;

      if (!hasOwnProperty(castedExpiry, 'value')) {
        return NexusResponse.EXPIRY_VALUE_MISSING;
      } else if (
        typeof castedExpiry.value !== 'object' ||
        !hasOwnProperty(castedExpiry.value, 'seconds') ||
        !hasOwnProperty(castedExpiry.value, 'nanoseconds')
      ) {
        return NexusResponse.EXPIRY_VALUE_INVALID;
      }
    } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
      const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

      if (
        !hasOwnProperty(castedExpiry, 'start') ||
        !hasOwnProperty(castedExpiry, 'end')
      ) {
        return NexusResponse.EXPIRY_DURATION_MISSING;
      } else if (
        typeof castedExpiry.start !== 'object' ||
        typeof castedExpiry.end !== 'object' ||
        !hasOwnProperty(castedExpiry.start, 'seconds') ||
        !hasOwnProperty(castedExpiry.start, 'nanoseconds') ||
        !hasOwnProperty(castedExpiry.end, 'seconds') ||
        !hasOwnProperty(castedExpiry.end, 'nanoseconds')
      ) {
        return NexusResponse.EXPIRY_DURATION_INVALID;
      }
    }
  }

  if (hasOwnProperty(nexusData, 'password')) {
    if (
      typeof nexusData.password !== 'string' &&
      (nexusData.password !== null || nexusData.password !== undefined)
    ) {
      return NexusResponse.PASSWORD_INVALID;
    }
  }

  return nexusData;
}

type GetNexusSuccess = {
  nexusData: Nexus;
  nexusDocRef: DocumentReference<Nexus>;
};

export async function getNexus(
  nexusId: string,
): Promise<GetNexusSuccess | null> {
  const nexusQuery = await nexusCollection
    .where('shortened', '==', nexusId)
    .get();

  if (!nexusQuery.empty) {
    // const nexusDocRef = doc(nexusCollection, qSnapshot.docs[0].id);
    // const nexusDoc = await getDocFromServer(nexusDocRef);
    const nexusDocRef = nexusCollection.doc(nexusQuery.docs[0].id);
    const nexusDoc = await nexusDocRef.get();

    // Should always exist since the previous query already checked for it
    // But just in case
    if (nexusDoc.exists) {
      const nexusData = nexusDoc.data() as Nexus;

      return {
        nexusData,
        nexusDocRef,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

type ValidateNexusFailure = {
  message:
    | NexusResponse.EXPIRED
    | NexusResponse.STATUS_INACTIVE
    | NexusResponse.TOO_EARLY;
  statusCode: HTTPStatusCode.NOT_FOUND | HTTPStatusCode.UNAUTHORIZED;
};

export function validateNexus(nexusData: Nexus): ValidateNexusFailure | null {
  const now = timestampNow();

  if (nexusData.status === NexusStatus.INACTIVE) {
    return {
      message: NexusResponse.STATUS_INACTIVE,
      statusCode: HTTPStatusCode.NOT_FOUND,
    };
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
      return {
        message: NexusResponse.EXPIRED,
        statusCode: HTTPStatusCode.UNAUTHORIZED,
      };
    }
  } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
    // Handle static expiry

    const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

    if (now < castedExpiry.start) {
      return {
        message: NexusResponse.TOO_EARLY,
        statusCode: HTTPStatusCode.UNAUTHORIZED,
      };
    } else if (now > castedExpiry.end) {
      return {
        message: NexusResponse.EXPIRED,
        statusCode: HTTPStatusCode.UNAUTHORIZED,
      };
    }
  }

  return null;
}

export type GetAndValidateNexusFailure = {
  success: false;
  message:
    | NexusResponse.ID_MISSING
    | NexusResponse.NOT_FOUND
    | ValidateNexusFailure['message'];
  statusCode: HTTPStatusCode.BAD_REQUEST | ValidateNexusFailure['statusCode'];
};

export type GetAndValidateNexusSuccess = {
  success: true;
  nexusData: Nexus;
  nexusDocRef: DocumentReference<Nexus>;
};

export async function getAndValidateNexus(
  nexusId?: string,
): Promise<GetAndValidateNexusFailure | GetAndValidateNexusSuccess> {
  if (!nexusId) {
    return {
      success: false,
      message: NexusResponse.ID_MISSING,
      statusCode: HTTPStatusCode.BAD_REQUEST,
    };
  }

  const nexusExist = await getNexus(nexusId);

  if (!nexusExist) {
    return {
      success: false,
      message: NexusResponse.NOT_FOUND,
      statusCode: HTTPStatusCode.NOT_FOUND,
    };
  }

  const { nexusData, nexusDocRef } = nexusExist;

  const validationError = validateNexus(nexusData);

  if (validationError !== null) {
    return {
      success: false,
      message: validationError.message,
      statusCode: validationError.statusCode,
    };
  } else {
    return {
      success: true,
      nexusData,
      nexusDocRef,
    };
  }
}
