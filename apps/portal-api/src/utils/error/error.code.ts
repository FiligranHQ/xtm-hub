export enum ForbiddenErrorCode {
  MissingCapabilityOnOrganization = 'MISSING_CAPABILITY_ON_ORGANIZATION',
  RegistrationOnAnotherOrganizationForbidden = 'REGISTRATION_ON_ANOTHER_ORGANIZATION_FORBIDDEN',
  UserIsNotInOrganization = 'USER_IS_NOT_IN_ORGANIZATION',
}

export enum BadRequestErrorCode {
  InvalidImageUrl = 'INVALID_IMAGE_URL',
  InvalidServiceConfiguration = 'INVALID_SERVICE_CONFIGURATION',
  PlatformNotRegistered = 'PLATFORM_NOT_REGISTERED',
  InvalidPlatformIdentifier = 'INVALID_PLATFORM_IDENTIFIER',
}

export enum UnknownErrorCode {
  CanUnregisterPlatformUnknownError = 'CAN_UNREGISTER_PLATFORM_UNKNOWN_ERROR',
  IsPlatformRegisteredUnknownError = 'IS_PLATFORM_REGISTERED_UNKNOWN_ERROR',
  RefreshUserPlatformTokenUnknownError = 'REFRESH_USER_PLATFORM_TOKEN_UNKNOWN_ERROR',
  RegisterPlatformUnknownError = 'REGISTER_PLATFORM_UNKNOWN_ERROR',
  UnknownError = 'UNKNOWN_ERROR',
  UnregisterPlatformUnknownError = 'UNREGISTER_PLATFORM_UNKNOWN_ERROR',
  AddOrganizationError = 'ADD_ORGANIZATION_ERROR',
  EditOrganizationError = 'EDIT_ORGANIZATION_ERROR',
  DeleteOrganizationError = 'DELETE_ORGANIZATION_ERROR',
  CsvFeedInsertionError = 'CSV_FEED_INSERTION_ERROR',
  CsvFeedUpdateError = 'CSV_FEED_UPDATE_ERROR',
  CsvFeedDeletionError = 'CSV_FEED_DELETION_ERROR',
}

export enum AlreadyExistsErrorCode {
  OrganizationSameNameExists = 'ORGANIZATION_SAME_NAME_EXISTS',
  CsvFeedUniqueSlugError = 'CSV_FEED_UNIQUE_SLUG_ERROR',
}

export enum NotFoundErrorCode {
  ServiceContractNotFound = 'SERVICE_CONTRACT_NOT_FOUND',
  ServiceDefinitionNotFound = 'SERVICE_DEFINITION_NOT_FOUND',
  SubscriptionNotFound = 'SUBSCRIPTION_NOT_FOUND',
}

export const ErrorCode = {
  ...ForbiddenErrorCode,
  ...BadRequestErrorCode,
  ...AlreadyExistsErrorCode,
  ...NotFoundErrorCode,
};
