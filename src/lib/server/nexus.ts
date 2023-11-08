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

type ValidateNexusDataSuccess = {
  error: false;
  nexusData: Partial<Nexus>;
};

type ValidateNexusDataFailed = {
  error: true;
  message:
    | NexusResponse.DESTINATION_INVALID
    | NexusResponse.DESTINATION_MISSING
    | NexusResponse.SHORTENED_INVALID
    | NexusResponse.SHORTENED_MISSING
    | NexusResponse.EXPIRY_INVALID
    | NexusResponse.EXPIRY_TYPE_INVALID
    | NexusResponse.EXPIRY_VALUE_MISSING
    | NexusResponse.EXPIRY_VALUE_INVALID
    | NexusResponse.EXPIRY_DURATION_MISSING
    | NexusResponse.EXPIRY_DURATION_INVALID
    | NexusResponse.PASSWORD_INVALID
    | NexusResponse.STATUS_INVALID;
  statusCode: HTTPStatusCode.BAD_REQUEST;
};
export function validateNexusData(
  nexusData: Partial<Nexus>,
  action: 'CREATE' | 'UPDATE' = 'CREATE',
): ValidateNexusDataSuccess | ValidateNexusDataFailed {
  if (action !== 'CREATE') {
    Object.keys(nexusData).forEach((key) => {
      if (nexusData[key as keyof Nexus] === undefined) {
        delete nexusData[key as keyof Nexus];
      }
    });
  }

  const sanitized: Partial<Nexus> = {};

  if (hasOwnProperty(nexusData, 'destination')) {
    sanitized.destination = nexusData.destination;

    if (typeof nexusData.destination !== 'string') {
      return {
        error: true,
        message: NexusResponse.DESTINATION_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    } else if (nexusData.destination.length <= 0) {
      return {
        error: true,
        message: NexusResponse.DESTINATION_MISSING,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }
  }

  if (hasOwnProperty(nexusData, 'shortened')) {
    sanitized.shortened = nexusData.shortened;

    if (typeof nexusData.shortened !== 'string') {
      return {
        error: true,
        message: NexusResponse.SHORTENED_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    } else if (action !== 'CREATE' && nexusData.shortened.length <= 0) {
      return {
        error: true,
        message: NexusResponse.SHORTENED_MISSING,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }
  }

  if (hasOwnProperty(nexusData, 'status')) {
    sanitized.status = nexusData.status;

    if (
      typeof nexusData.status !== 'string' ||
      !Object.values(NexusStatus).includes(nexusData.status as NexusStatus)
    ) {
      return {
        error: true,
        message: NexusResponse.STATUS_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }
  }

  if (hasOwnProperty(nexusData, 'expiry')) {
    sanitized.expiry = nexusData.expiry;

    if (typeof nexusData.expiry !== 'object') {
      return {
        error: true,
        message: NexusResponse.EXPIRY_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }

    if (
      typeof nexusData.expiry.type !== 'string' ||
      !Object.values(NexusExpiryType).includes(nexusData.expiry.type)
    ) {
      return {
        error: true,
        message: NexusResponse.EXPIRY_TYPE_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }

    if (nexusData.expiry.type === NexusExpiryType.DYNAMIC) {
      const castedExpiry = nexusData.expiry as NexusExpiryTypeDynamic;

      if (!hasOwnProperty(castedExpiry, 'value')) {
        return {
          error: true,
          message: NexusResponse.EXPIRY_VALUE_MISSING,
          statusCode: HTTPStatusCode.BAD_REQUEST,
        };
      } else if (
        typeof castedExpiry.value !== 'object' ||
        !hasOwnProperty(castedExpiry.value, 'seconds') ||
        !hasOwnProperty(castedExpiry.value, 'nanoseconds')
      ) {
        return {
          error: true,
          message: NexusResponse.EXPIRY_VALUE_INVALID,
          statusCode: HTTPStatusCode.BAD_REQUEST,
        };
      }
    } else if (nexusData.expiry.type === NexusExpiryType.STATIC) {
      const castedExpiry = nexusData.expiry as NexusExpiryTypeStatic;

      if (
        !hasOwnProperty(castedExpiry, 'start') ||
        !hasOwnProperty(castedExpiry, 'end')
      ) {
        return {
          error: true,
          message: NexusResponse.EXPIRY_DURATION_MISSING,
          statusCode: HTTPStatusCode.BAD_REQUEST,
        };
      } else if (
        typeof castedExpiry.start !== 'object' ||
        typeof castedExpiry.end !== 'object' ||
        !hasOwnProperty(castedExpiry.start, 'seconds') ||
        !hasOwnProperty(castedExpiry.start, 'nanoseconds') ||
        !hasOwnProperty(castedExpiry.end, 'seconds') ||
        !hasOwnProperty(castedExpiry.end, 'nanoseconds')
      ) {
        return {
          error: true,
          message: NexusResponse.EXPIRY_DURATION_INVALID,
          statusCode: HTTPStatusCode.BAD_REQUEST,
        };
      }
    }
  }

  if (hasOwnProperty(nexusData, 'password')) {
    sanitized.password = nexusData.password;

    if (typeof nexusData.password !== 'string' && nexusData.password !== null) {
      return {
        error: true,
        message: NexusResponse.PASSWORD_INVALID,
        statusCode: HTTPStatusCode.BAD_REQUEST,
      };
    }
  }

  return {
    error: false,
    nexusData: {
      ...sanitized,
    },
  };
}

type GetNexusSuccess = {
  exist: true;
  nexusData: Nexus;
  nexusDocRef: DocumentReference<Nexus>;
};

type GetNexusFailed = {
  exist: false;
  message: NexusResponse.NOT_FOUND;
  statusCode: HTTPStatusCode.NOT_FOUND;
};

export async function getNexus(
  nexusId: string,
): Promise<GetNexusSuccess | GetNexusFailed> {
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
        exist: true,
        nexusData,
        nexusDocRef,
      };
    } else {
      return {
        exist: false,
        message: NexusResponse.NOT_FOUND,
        statusCode: HTTPStatusCode.NOT_FOUND,
      };
    }
  } else {
    return {
      exist: false,
      message: NexusResponse.NOT_FOUND,
      statusCode: HTTPStatusCode.NOT_FOUND,
    };
  }
}

type ValidateNexusFailed = {
  message:
    | NexusResponse.EXPIRED
    | NexusResponse.STATUS_INACTIVE
    | NexusResponse.TOO_EARLY;
  statusCode: HTTPStatusCode.NOT_FOUND | HTTPStatusCode.UNAUTHORIZED;
};

export function validateNexus(nexusData: Nexus): ValidateNexusFailed | null {
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

export type GetAndValidateNexusSuccess = {
  valid: true;
  nexusData: Nexus;
  nexusDocRef: DocumentReference<Nexus>;
};

export type GetAndValidateNexusFailed = {
  valid: false;
  message:
    | NexusResponse.ID_MISSING
    | NexusResponse.NOT_FOUND
    | ValidateNexusFailed['message'];
  statusCode: HTTPStatusCode.BAD_REQUEST | ValidateNexusFailed['statusCode'];
};

export async function getAndValidateNexus(
  nexusId: string,
): Promise<GetAndValidateNexusFailed | GetAndValidateNexusSuccess> {
  if (!nexusId) {
    return {
      valid: false,
      message: NexusResponse.ID_MISSING,
      statusCode: HTTPStatusCode.BAD_REQUEST,
    };
  }

  const existingNexus = await getNexus(nexusId);

  if (!existingNexus.exist) {
    return {
      valid: false,
      message: existingNexus.message,
      statusCode: existingNexus.statusCode,
    };
  }

  const { nexusData, nexusDocRef } = existingNexus;

  const validationError = validateNexus(nexusData);

  if (validationError !== null) {
    return {
      valid: false,
      message: validationError.message,
      statusCode: validationError.statusCode,
    };
  } else {
    return {
      valid: true,
      nexusData,
      nexusDocRef,
    };
  }
}
