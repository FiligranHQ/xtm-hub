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
}

export enum NotFoundErrorCode {
  ServiceContractNotFound = 'SERVICE_CONTRACT_NOT_FOUND',
  ServiceDefinitionNotFound = 'SERVICE_DEFINITION_NOT_FOUND',
  SubscriptionNotFound = 'SUBSCRIPTION_NOT_FOUND',
}

export const ErrorCode = {
  ...ForbiddenErrorCode,
  ...UnknownErrorCode,
  ...NotFoundErrorCode,
  ...BadRequestErrorCode,
};
