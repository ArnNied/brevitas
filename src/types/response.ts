export enum HTTPStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum NexusResponse {
  DOCUMENT_GET_ERROR = 'Error getting nexus document',
  NEW_DOCUMENT_GET_ERROR = 'Error getting newly created nexus document',

  CREATE_SUCCESS = 'Nexus successfully created',
  CREATE_ERROR = 'Error creating nexus',

  UPDATE_SUCCESS = 'Nexus successfully updated',
  UPDATE_ERROR = 'Error updating nexus',

  DELETE_SUCCESS = 'Nexus successfully deleted',
  DELETE_ERROR = 'Error deleting nexus',

  FOUND = 'Nexus found',
  NOT_FOUND = 'Nexus not found',

  ID_MISSING = 'Missing nexus ID',
  ID_INVALID = 'Invalid nexus ID',

  STATUS_INACTIVE = 'Nexus is inactive',

  DESTINATION_MISSING = 'Missing destination',
  DESTINATION_INVALID = 'Invalid destination',

  SHORTENED_TAKEN = 'Shortened URL already taken',
  SHORTENED_INVALID = 'Invalid shortened',

  EXPIRY_MISSING = 'Missing expiry',

  EXPIRY_TYPE_MISSING = 'Missing expiry type',
  EXPIRY_TYPE_INVALID = 'Invalid expiry type',

  EXPIRY_VALUE_MISSING = 'Missing expiry value',
  EXPIRY_VALUE_INVALID = 'Invalid expiry value',

  EXPIRY_DURATION_MISSING = 'Missing expiry start/end',
  EXPIRY_DURATION_INVALID = 'Invalid expiry start/end',

  PASSWORD_MISSING = 'Missing password',
  PASSWORD_REQUIRED = 'Password required',
  PASSWORD_INVALID = 'Invalid password',
  PASSWORD_INCORRECT = 'Incorrect password',

  ENCRYPT_ERROR = 'Error encrypting password',
  DECRYPT_ERROR = 'Error decrypting password',

  TOO_EARLY = 'Too early',
  EXPIRED = 'Nexus expired',
}