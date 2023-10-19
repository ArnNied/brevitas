import { doc, getDocFromServer, Timestamp } from 'firebase/firestore';

import { NexusExpiryType, NexusStatus } from '@/types/nexus';
import { HTTPStatusCode, NexusResponse } from '@/types/response';

import { nexusCollection } from './firebase/firestore';
import { timestampNow } from './utils';

import type {
  NexusExpiryTypeDynamic,
  NexusExpiryTypeStatic,
  TNexus,
  NexusCreateRequestData,
} from '@/types/nexus';
import type { DocumentReference, DocumentData } from 'firebase/firestore';

type ValidateNexusFailure = {
  message:
    | NexusResponse.EXPIRED
    | NexusResponse.STATUS_INACTIVE
    | NexusResponse.TOO_EARLY;
  statusCode: HTTPStatusCode.NOT_FOUND | HTTPStatusCode.UNAUTHORIZED;
};

type GetAndValidateNexusFailure = {
  success: false;
  message:
    | NexusResponse.ID_MISSING
    | NexusResponse.NOT_FOUND
    | ValidateNexusFailure['message'];
  statusCode: HTTPStatusCode.BAD_REQUEST | ValidateNexusFailure['statusCode'];
};

type GetAndValidateNexusSuccess = {
  success: true;
  nexusData: TNexus;
  nexusDocRef: DocumentReference<TNexus, DocumentData>;
};

export function validateNexusData(
  nexusData: NexusCreateRequestData,
): NexusCreateRequestData | NexusResponse {
  if (!nexusData.destination) {
    return NexusResponse.DESTINATION_MISSING;
  } else if (!nexusData.expiry) {
    return NexusResponse.EXPIRY_MISSING;
  } else if (!nexusData.expiry.type) {
    return NexusResponse.EXPIRY_TYPE_MISSING;
  }

  if (typeof nexusData.destination !== 'string') {
    return NexusResponse.DESTINATION_INVALID;
  } else if (typeof nexusData.shortened !== 'string') {
    return NexusResponse.SHORTENED_INVALID;
  } else if (
    nexusData.password !== null &&
    typeof nexusData.password !== 'string'
  ) {
    return NexusResponse.PASSWORD_INVALID;
  } else if (!Object.values(NexusExpiryType).includes(nexusData.expiry.type)) {
    return NexusResponse.EXPIRY_TYPE_INVALID;
  }

  if (nexusData.expiry.type === NexusExpiryType.DYNAMIC) {
    const castedExpiry = nexusData.expiry as NexusExpiryTypeDynamic;

    if (!castedExpiry.value) {
      return NexusResponse.EXPIRY_VALUE_MISSING;
    } else if (typeof castedExpiry.value !== 'object') {
      return NexusResponse.EXPIRY_VALUE_INVALID;
    }
  } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
    const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

    if (!castedExpiry.start || !castedExpiry.end) {
      return NexusResponse.EXPIRY_DURATION_MISSING;
    } else if (
      typeof castedExpiry.start !== 'object' ||
      typeof castedExpiry.end !== 'object'
    ) {
      return NexusResponse.EXPIRY_DURATION_INVALID;
    }
  }

  return nexusData;
}

export async function getNexus(nexusId: string): Promise<{
  nexusData: TNexus;
  nexusDocRef: DocumentReference<TNexus, DocumentData>;
} | null> {
  const nexusDocRef = doc(nexusCollection, nexusId);
  const nexusDocSnap = await getDocFromServer(nexusDocRef);

  if (nexusDocSnap.exists()) {
    const nexusData = nexusDocSnap.data();

    return {
      nexusData,
      nexusDocRef,
    };
  } else {
    return null;
  }
}

export function validateNexus(nexusData: TNexus): ValidateNexusFailure | null {
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
