import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { PortalContext } from '../model/portal-context.js';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AddServiceInput = {
  fee_type?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  service_instance_description?: InputMaybe<Scalars['String']['input']>;
  service_instance_name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type AddUseCaseInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type AddUserInput = {
  capabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  email: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};

export type AdminAddUserInput = {
  email: Scalars['String']['input'];
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_capabilities?: InputMaybe<Array<OrganizationCapabilitiesInput>>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type AdminEditUserInput = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_capabilities?: InputMaybe<Array<OrganizationCapabilitiesInput>>;
};

export type BulkPendingUserFromOrganizationInput = {
  excludedIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  filters?: InputMaybe<Array<Filter>>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type CanUnregisterPlatformInput = {
  platformId: Scalars['String']['input'];
};

export type CanUnregisterResponse = {
  __typename?: 'CanUnregisterResponse';
  isAllowed?: Maybe<Scalars['Boolean']['output']>;
  isInOrganization?: Maybe<Scalars['Boolean']['output']>;
  isPlatformRegistered: Scalars['Boolean']['output'];
  organizationId?: Maybe<Scalars['ID']['output']>;
};

export type Capability = Node & {
  __typename?: 'Capability';
  id: Scalars['ID']['output'];
  name: PortalCapability;
};

export type Connector = Document & Integration & Node & {
  __typename?: 'Connector';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  container_image?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  manager_supported: Scalars['Boolean']['output'];
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  playbook_supported: Scalars['Boolean']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  source_code?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  subscription_link?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
  verified: Scalars['Boolean']['output'];
};

export type CreateDeploymentRequestInput = {
  activity_sector?: InputMaybe<Scalars['String']['input']>;
  job_title?: InputMaybe<Scalars['String']['input']>;
  platform_identifier: PlatformIdentifier;
  region: DeploymentRequestPlatformRegion;
  type: DeploymentRequestDeploymentType;
  use_case?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDocumentInput = {
  active: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  uploader_id: Scalars['String']['input'];
  use_cases?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CsvFeed = Document & Integration & Node & {
  __typename?: 'CsvFeed';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  feed_url?: Maybe<Scalars['String']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type CustomDashboard = Document & Node & {
  __typename?: 'CustomDashboard';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

/**
 * /!\ WARNING Do not use this type.
 * It exists only to cover cases where we failed to map to a specific Document.
 */
export type DefaultDocument = Document & Node & {
  __typename?: 'DefaultDocument';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type DeployedPlatform = {
  __typename?: 'DeployedPlatform';
  platformIdentifier: PlatformIdentifier;
  serviceInstanceId: Scalars['ID']['output'];
};

export type DeploymentAvailability = {
  __typename?: 'DeploymentAvailability';
  availableCount: Scalars['Int']['output'];
  capacity: Scalars['Int']['output'];
  platform_identifier: PlatformIdentifier;
  region: DeploymentRequestPlatformRegion;
};

export type DeploymentRequest = Node & {
  __typename?: 'DeploymentRequest';
  activity_sector?: Maybe<Scalars['String']['output']>;
  cancellation_date?: Maybe<Scalars['Date']['output']>;
  cancellation_reason?: Maybe<Scalars['String']['output']>;
  cancellation_user_email?: Maybe<Scalars['String']['output']>;
  counts_in_orga_quota: Scalars['Boolean']['output'];
  end_date?: Maybe<Scalars['Date']['output']>;
  hub_status: DeploymentRequestHubStatus;
  id: Scalars['ID']['output'];
  job_title?: Maybe<Scalars['String']['output']>;
  ordering: Scalars['Int']['output'];
  organization_name?: Maybe<Scalars['String']['output']>;
  platform_id?: Maybe<Scalars['String']['output']>;
  platform_identifier: PlatformIdentifier;
  platform_url?: Maybe<Scalars['String']['output']>;
  region: DeploymentRequestPlatformRegion;
  request_date: Scalars['Date']['output'];
  requester_email?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['Date']['output']>;
  type: DeploymentRequestDeploymentType;
  use_case?: Maybe<Scalars['String']['output']>;
};

export type DeploymentRequestConnection = {
  __typename?: 'DeploymentRequestConnection';
  edges: Array<DeploymentRequestEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum DeploymentRequestDeploymentType {
  Trial = 'trial'
}

export type DeploymentRequestEdge = {
  __typename?: 'DeploymentRequestEdge';
  cursor: Scalars['String']['output'];
  node: DeploymentRequest;
};

export type DeploymentRequestFilter = {
  key?: InputMaybe<DeploymentRequestFilterKey>;
  value: Array<Scalars['String']['input']>;
};

export enum DeploymentRequestFilterKey {
  ActualState = 'actual_state',
  HubStatus = 'hub_status',
  PlatformIdentifier = 'platform_identifier',
  Region = 'region',
  TargetState = 'target_state',
  Type = 'type'
}

export enum DeploymentRequestHubStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Failed = 'failed',
  Pending = 'pending',
  Provisioning = 'provisioning',
  Queued = 'queued'
}

export enum DeploymentRequestOrdering {
  CancellationDate = 'cancellation_date',
  CancellationReason = 'cancellation_reason',
  CancellationUserEmail = 'cancellation_user_email',
  EndDate = 'end_date',
  HubStatus = 'hub_status',
  Ordering = 'ordering',
  OrganizationName = 'organization_name',
  Region = 'region',
  RequestDate = 'request_date',
  RequesterEmail = 'requester_email',
  StartDate = 'start_date'
}

export enum DeploymentRequestPlatformRegion {
  ApacAu = 'apac_au',
  ApacSg = 'apac_sg',
  EuWest = 'eu_west',
  UsEast = 'us_east'
}

export enum DeploymentRequestPlatformState {
  Active = 'active',
  Provisioning = 'provisioning',
  Removed = 'removed',
  Removing = 'removing',
  Unprovisioned = 'unprovisioned'
}

export type Document = {
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type DocumentConnection = {
  __typename?: 'DocumentConnection';
  edges: Array<DocumentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DocumentEdge = {
  __typename?: 'DocumentEdge';
  cursor: Scalars['String']['output'];
  node: Document;
};

export type DocumentMetadata = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export enum DocumentOrdering {
  CreatedAt = 'created_at',
  Description = 'description',
  DownloadNumber = 'download_number',
  FileName = 'file_name',
  Name = 'name',
  UpdatedAt = 'updated_at'
}

export type EditMeUserInput = {
  country?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  picture?: InputMaybe<Scalars['String']['input']>;
};

export type EditServiceCapabilityInput = {
  capabilities: Array<InputMaybe<Scalars['String']['input']>>;
  user_service_id?: InputMaybe<Scalars['String']['input']>;
};

export type EditUseCaseInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type EditUserCapabilitiesInput = {
  capabilities?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Filter = {
  key?: InputMaybe<FilterKey>;
  value: Array<Scalars['String']['input']>;
};

export enum FilterKey {
  FeedUrl = 'feed_url',
  IntegrationSubtype = 'integration_subtype',
  IntegrationType = 'integration_type',
  Label = 'label',
  ManagerSupported = 'manager_supported',
  OrganizationId = 'organization_id',
  PersonalSpace = 'personal_space',
  ProductVersion = 'product_version',
  Slug = 'slug',
  Verified = 'verified'
}

export type GenericServiceCapability = Node & {
  __typename?: 'GenericServiceCapability';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type Integration = {
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type IntegrationHack = Document & Integration & Node & {
  __typename?: 'IntegrationHack';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export enum IntegrationSubType {
  CaseManagement = 'CASE_MANAGEMENT',
  Detection = 'DETECTION',
  ExternalImport = 'EXTERNAL_IMPORT',
  InternalEnrichment = 'INTERNAL_ENRICHMENT',
  InternalExportFile = 'INTERNAL_EXPORT_FILE',
  InternalImportFile = 'INTERNAL_IMPORT_FILE',
  Native = 'NATIVE',
  Orchestration = 'ORCHESTRATION',
  Stream = 'STREAM'
}

export enum IntegrationType {
  Connector = 'connector',
  CsvFeed = 'csv_feed',
  JsonFeed = 'json_feed',
  RssFeed = 'rss_feed',
  Stream = 'stream',
  TaxiiFeed = 'taxii_feed',
  ThirdPartyIntegration = 'third_party_integration'
}

export type IsPlatformRegisteredInput = {
  platformId: Scalars['String']['input'];
};

export type IsPlatformRegisteredOrganization = Node & {
  __typename?: 'IsPlatformRegisteredOrganization';
  id: Scalars['ID']['output'];
};

export type IsPlatformRegisteredResponse = {
  __typename?: 'IsPlatformRegisteredResponse';
  organization?: Maybe<IsPlatformRegisteredOrganization>;
  platformTitle?: Maybe<Scalars['String']['output']>;
  status: PlatformRegistrationStatus;
};

export type LogicalFilterInput = {
  children?: InputMaybe<Array<LogicalFilterInput>>;
  leaf?: InputMaybe<Filter>;
  operator?: InputMaybe<LogicalOperator>;
};

export enum LogicalOperator {
  And = 'AND',
  Or = 'OR'
}

export type MeUserSubscription = {
  __typename?: 'MeUserSubscription';
  delete?: Maybe<User>;
  edit?: Maybe<User>;
};

export type MergeEvent = Node & {
  __typename?: 'MergeEvent';
  from: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  target: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addOrganization?: Maybe<Organization>;
  addServicePicture?: Maybe<ServiceInstance>;
  addSubscription?: Maybe<ServiceInstance>;
  addSubscriptionInService?: Maybe<ServiceInstance>;
  addUseCase: UseCase;
  addUser?: Maybe<User>;
  addUserService?: Maybe<Array<Maybe<UserService>>>;
  addYourselfInUserService?: Maybe<Array<Maybe<UserService>>>;
  adminAddUser?: Maybe<User>;
  adminCancelDeploymentRequest?: Maybe<DeploymentRequest>;
  adminEditUser: User;
  autoRegisterPlatform: Success;
  bulkAcceptPendingUserInOrganization?: Maybe<Success>;
  bulkRemovePendingUserFromOrganization?: Maybe<Success>;
  cancelDeploymentRequest?: Maybe<DeploymentRequest>;
  changeSelectedOrganization?: Maybe<User>;
  contactUs: Success;
  createDeploymentRequest: DeploymentRequest;
  createDocument: Document;
  deleteDocument: Document;
  deleteOrganization?: Maybe<Organization>;
  deleteSubscription?: Maybe<ServiceInstance>;
  deleteUseCase: UseCase;
  deleteUserService?: Maybe<UserService>;
  editMeUser: User;
  editOrganization?: Maybe<Organization>;
  editServiceCapability?: Maybe<SubscriptionModel>;
  editUseCase: UseCase;
  editUserCapabilities: User;
  frontendErrorLog?: Maybe<Scalars['Boolean']['output']>;
  incrementShareNumberDocument: Document;
  login?: Maybe<User>;
  logout: Scalars['ID']['output'];
  mergeTest: Scalars['ID']['output'];
  refreshPlatformRegistrationConnectivityStatus: RefreshPlatformRegistrationConnectivityStatusResponse;
  refreshUserPlatformToken: RefreshUserPlatformTokenResponse;
  registerPlatform: RegistrationResponse;
  removePendingUserFromOrganization?: Maybe<User>;
  removeUserFromOrganization?: Maybe<User>;
  reorderDeploymentRequestInQueue: Success;
  requestTransferPersonalSpace: Success;
  resetPassword: Success;
  sendTelemetryEvent?: Maybe<SendTelemetryMutation>;
  transferPersonalSpace: Success;
  unregisterPlatform: Success;
  updateDeploymentQuotaCapacity: Success;
  updateDeploymentRequest: PlatformDeploymentRequest;
  updateDocument: Document;
  updatePlatformServiceMetadata?: Maybe<RegisteredPlatform>;
  updateServiceGroups?: Maybe<Success>;
};


export type MutationAddOrganizationArgs = {
  input: OrganizationInput;
};


export type MutationAddServicePictureArgs = {
  document?: InputMaybe<Scalars['Upload']['input']>;
  isLogo?: InputMaybe<Scalars['Boolean']['input']>;
  serviceInstanceId: Scalars['ID']['input'];
};


export type MutationAddSubscriptionArgs = {
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddSubscriptionInServiceArgs = {
  capability_ids?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
};


export type MutationAddUseCaseArgs = {
  input: AddUseCaseInput;
};


export type MutationAddUserArgs = {
  input: AddUserInput;
};


export type MutationAddUserServiceArgs = {
  input: UserServiceAddInput;
};


export type MutationAddYourselfInUserServiceArgs = {
  input: UserServiceAddYourselfInput;
};


export type MutationAdminAddUserArgs = {
  input: AdminAddUserInput;
};


export type MutationAdminCancelDeploymentRequestArgs = {
  deploymentRequestId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAdminEditUserArgs = {
  id: Scalars['ID']['input'];
  input: AdminEditUserInput;
};


export type MutationAutoRegisterPlatformArgs = {
  platform: PlatformInput;
};


export type MutationBulkAcceptPendingUserInOrganizationArgs = {
  input?: InputMaybe<BulkPendingUserFromOrganizationInput>;
};


export type MutationBulkRemovePendingUserFromOrganizationArgs = {
  input?: InputMaybe<BulkPendingUserFromOrganizationInput>;
};


export type MutationCancelDeploymentRequestArgs = {
  cancellationReason?: InputMaybe<Scalars['String']['input']>;
  deploymentRequestId: Scalars['ID']['input'];
};


export type MutationChangeSelectedOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
};


export type MutationContactUsArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  platformId?: InputMaybe<Scalars['ID']['input']>;
  platformIdentifier?: InputMaybe<PlatformIdentifier>;
};


export type MutationCreateDeploymentRequestArgs = {
  input?: InputMaybe<CreateDeploymentRequestInput>;
};


export type MutationCreateDocumentArgs = {
  document: Array<Scalars['Upload']['input']>;
  input: CreateDocumentInput;
  metadata: Array<DocumentMetadata>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  forceDelete?: InputMaybe<Scalars['Boolean']['input']>;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubscriptionArgs = {
  subscription_id: Scalars['ID']['input'];
};


export type MutationDeleteUseCaseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserServiceArgs = {
  input: UserServiceDeleteInput;
};


export type MutationEditMeUserArgs = {
  input: EditMeUserInput;
};


export type MutationEditOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: OrganizationInput;
};


export type MutationEditServiceCapabilityArgs = {
  input?: InputMaybe<EditServiceCapabilityInput>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditUseCaseArgs = {
  id: Scalars['ID']['input'];
  input: EditUseCaseInput;
};


export type MutationEditUserCapabilitiesArgs = {
  id: Scalars['ID']['input'];
  input: EditUserCapabilitiesInput;
};


export type MutationFrontendErrorLogArgs = {
  codeStack?: InputMaybe<Scalars['String']['input']>;
  componentStack?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
};


export type MutationIncrementShareNumberDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMergeTestArgs = {
  from: Scalars['ID']['input'];
  target: Scalars['ID']['input'];
};


export type MutationRefreshPlatformRegistrationConnectivityStatusArgs = {
  input: RefreshPlatformRegistrationConnectivityStatusInput;
};


export type MutationRegisterPlatformArgs = {
  input: RegisterPlatformInput;
};


export type MutationRemovePendingUserFromOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};


export type MutationRemoveUserFromOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};


export type MutationReorderDeploymentRequestInQueueArgs = {
  input: ReorderDeploymentRequestInQueueInput;
};


export type MutationRequestTransferPersonalSpaceArgs = {
  new_email?: InputMaybe<Scalars['String']['input']>;
};


export type MutationTransferPersonalSpaceArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationUnregisterPlatformArgs = {
  input?: InputMaybe<UnregisterPlatformInput>;
};


export type MutationUpdateDeploymentQuotaCapacityArgs = {
  input: UpdateDeploymentQuotaCapacityInput;
};


export type MutationUpdateDeploymentRequestArgs = {
  input: UpdateDeploymentRequestInput;
};


export type MutationUpdateDocumentArgs = {
  document: Array<Scalars['Upload']['input']>;
  documentId: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  input: UpdateDocumentInput;
  metadata: Array<DocumentMetadata>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
  updateDocument: Scalars['Boolean']['input'];
};


export type MutationUpdatePlatformServiceMetadataArgs = {
  document?: InputMaybe<Scalars['Upload']['input']>;
  input: UpdatePlatformServiceMetadataInput;
};


export type MutationUpdateServiceGroupsArgs = {
  input: UpdateServiceGroupsInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type OneClickDeployInput = {
  platform_identifier: PlatformIdentifier;
  platform_service_instance_id: Scalars['ID']['input'];
  resource_id: Scalars['ID']['input'];
  resource_title: Scalars['String']['input'];
  service_instance_id: Scalars['ID']['input'];
};

export type OpenAevScenario = Document & Node & {
  __typename?: 'OpenAEVScenario';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type OpenAevScenarioConnection = {
  __typename?: 'OpenAEVScenarioConnection';
  edges: Array<OpenAevScenarioEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OpenAevScenarioEdge = {
  __typename?: 'OpenAEVScenarioEdge';
  cursor: Scalars['String']['output'];
  node: OpenAevScenario;
};

export type OpenCtiPlatformRegistrationStatusInput = {
  platformId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type OpenCtiPlatformRegistrationStatusResponse = {
  __typename?: 'OpenCTIPlatformRegistrationStatusResponse';
  status: PlatformRegistrationConnectivityStatus;
};

export enum OrderingMode {
  Asc = 'asc',
  Desc = 'desc'
}

export type Organization = Node & {
  __typename?: 'Organization';
  capabilityUser?: Maybe<Array<Maybe<Capability>>>;
  domains?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  personal_space: Scalars['Boolean']['output'];
};

export type OrganizationCapabilities = Node & {
  __typename?: 'OrganizationCapabilities';
  capabilities?: Maybe<Array<OrganizationCapability>>;
  id: Scalars['ID']['output'];
  organization: Organization;
};

export type OrganizationCapabilitiesInput = {
  capabilities?: InputMaybe<Array<Scalars['String']['input']>>;
  organization_id: Scalars['ID']['input'];
};

export enum OrganizationCapability {
  AdministrateOrganization = 'ADMINISTRATE_ORGANIZATION',
  ManageAccess = 'MANAGE_ACCESS',
  ManagePlatformRegistration = 'MANAGE_PLATFORM_REGISTRATION',
  ManageSubscription = 'MANAGE_SUBSCRIPTION'
}

export type OrganizationConnection = {
  __typename?: 'OrganizationConnection';
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OrganizationEdge = {
  __typename?: 'OrganizationEdge';
  cursor: Scalars['String']['output'];
  node: Organization;
};

export type OrganizationId = Node & {
  __typename?: 'OrganizationId';
  id: Scalars['ID']['output'];
};

export type OrganizationInput = {
  domains?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
};

export enum OrganizationOrdering {
  Name = 'name'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum PlatformContract {
  Ce = 'CE',
  Ee = 'EE',
  Trial = 'trial'
}

export type PlatformDeploymentRequest = {
  __typename?: 'PlatformDeploymentRequest';
  activity_sector?: Maybe<Scalars['String']['output']>;
  actual_state?: Maybe<DeploymentRequestPlatformState>;
  end_date?: Maybe<Scalars['Date']['output']>;
  failure_reason?: Maybe<Scalars['String']['output']>;
  hub_status: DeploymentRequestHubStatus;
  id: Scalars['ID']['output'];
  job_title?: Maybe<Scalars['String']['output']>;
  ordering: Scalars['Int']['output'];
  organization_domains?: Maybe<Array<Scalars['String']['output']>>;
  organization_name: Scalars['String']['output'];
  platform_id?: Maybe<Scalars['String']['output']>;
  platform_identifier: PlatformIdentifier;
  platform_token: Scalars['String']['output'];
  platform_url?: Maybe<Scalars['String']['output']>;
  region: DeploymentRequestPlatformRegion;
  requester_email: Scalars['String']['output'];
  requester_first_name?: Maybe<Scalars['String']['output']>;
  requester_last_name?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['Date']['output']>;
  target_state?: Maybe<DeploymentRequestPlatformState>;
  type: DeploymentRequestDeploymentType;
  use_case?: Maybe<Scalars['String']['output']>;
};

export type PlatformDeploymentRequestConnection = {
  __typename?: 'PlatformDeploymentRequestConnection';
  edges: Array<PlatformDeploymentRequestEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PlatformDeploymentRequestEdge = {
  __typename?: 'PlatformDeploymentRequestEdge';
  cursor: Scalars['String']['output'];
  node: PlatformDeploymentRequest;
};

export enum PlatformIdentifier {
  Openaev = 'openaev',
  Opencti = 'opencti'
}

export type PlatformInput = {
  contract: PlatformContract;
  id: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
  version?: InputMaybe<Scalars['String']['input']>;
};

export type PlatformProvider = {
  __typename?: 'PlatformProvider';
  name: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum PlatformRegistrationConnectivityStatus {
  Active = 'active',
  Inactive = 'inactive',
  NotFound = 'not_found'
}

export enum PlatformRegistrationStatus {
  NeverRegistered = 'never_registered',
  Registered = 'registered',
  Unregistered = 'unregistered'
}

export enum PortalCapability {
  Bypass = 'BYPASS',
  ModifyTrials = 'MODIFY_TRIALS',
  ReadTrials = 'READ_TRIALS'
}

export type Query = {
  __typename?: 'Query';
  canUnregisterPlatform: CanUnregisterResponse;
  deploymentRequests: PlatformDeploymentRequestConnection;
  deploymentRequestsAvailable: Array<DeploymentAvailability>;
  deploymentRequestsList: DeploymentRequestConnection;
  document?: Maybe<Document>;
  documentExists?: Maybe<Scalars['Boolean']['output']>;
  documents: DocumentConnection;
  isPlatformRegistered: IsPlatformRegisteredResponse;
  me?: Maybe<User>;
  node?: Maybe<Node>;
  /** @deprecated Use `refreshPlatformRegistrationConnectivityStatus` instead. This field is no longer used in the OpenCTI platform due to refactoring and the addition of a version value in the endpoint. */
  openCTIPlatformRegistrationStatus: OpenCtiPlatformRegistrationStatusResponse;
  organization?: Maybe<Organization>;
  organizations: OrganizationConnection;
  pendingUsers: UserConnection;
  platformAssociatedOrganization?: Maybe<Organization>;
  publicDocumentBySlug?: Maybe<Document>;
  publicDocuments: DocumentConnection;
  publicIntegrationsByServiceSlug?: Maybe<Array<Maybe<Integration>>>;
  publicServiceInstances: ServiceConnection;
  registeredPlatform?: Maybe<RegisteredPlatform>;
  registeredPlatforms: Array<RegisteredPlatform>;
  rolePortal?: Maybe<RolePortal>;
  rolesPortal: Array<RolePortal>;
  seoCustomDashboardsByServiceSlug?: Maybe<Array<Maybe<CustomDashboard>>>;
  seoOpenAEVScenariosByServiceSlug?: Maybe<Array<Maybe<OpenAevScenario>>>;
  seoServiceInstance: SeoServiceInstance;
  seoServiceInstances: Array<SeoServiceInstance>;
  serviceGroups: Array<ServiceGroup>;
  serviceInstanceById?: Maybe<ServiceInstance>;
  serviceInstanceByIdWithSubscriptions?: Maybe<ServiceInstance>;
  serviceInstanceLinksByTags: Array<SeoServiceInstance>;
  serviceInstances: ServiceConnection;
  serviceUsers?: Maybe<UserServiceConnection>;
  settings: Settings;
  subscribedServiceInstancesByIdentifier: Array<SubscribedServiceInstance>;
  subscriptionById?: Maybe<SubscriptionModel>;
  trialDeployments: TrialsDeployments;
  updateOpenCTIManifest: Success;
  useCases?: Maybe<UseCaseConnection>;
  userHasOrganizationWithSubscription: Scalars['Boolean']['output'];
  userOrganizations: Array<Organization>;
  userServiceFromSubscription?: Maybe<UserServiceConnection>;
  userServiceOwned?: Maybe<UserServiceConnection>;
  users: UserConnection;
  usersWithCapabilitiesInOrganization: Array<User>;
};


export type QueryCanUnregisterPlatformArgs = {
  input: CanUnregisterPlatformInput;
};


export type QueryDeploymentRequestsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<DeploymentRequestFilter>>;
  first: Scalars['Int']['input'];
};


export type QueryDeploymentRequestsAvailableArgs = {
  platformIdentifier?: InputMaybe<PlatformIdentifier>;
};


export type QueryDeploymentRequestsListArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<DeploymentRequestFilter>>;
  first: Scalars['Int']['input'];
  orderBy: DeploymentRequestOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDocumentExistsArgs = {
  documentName?: InputMaybe<Scalars['String']['input']>;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDocumentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  logicalFilters?: InputMaybe<LogicalFilterInput>;
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  parentsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIsPlatformRegisteredArgs = {
  input: IsPlatformRegisteredInput;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOpenCtiPlatformRegistrationStatusArgs = {
  input: OpenCtiPlatformRegistrationStatusInput;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: OrganizationOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPendingUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformAssociatedOrganizationArgs = {
  platformId: Scalars['String']['input'];
};


export type QueryPublicDocumentBySlugArgs = {
  serviceInstanceId: Scalars['ID']['input'];
  slug: Scalars['String']['input'];
};


export type QueryPublicDocumentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  logicalFilters?: InputMaybe<LogicalFilterInput>;
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId: Scalars['ID']['input'];
  slug: Scalars['String']['input'];
};


export type QueryPublicIntegrationsByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublicServiceInstancesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
};


export type QueryRegisteredPlatformArgs = {
  input: RegisteredPlatformInput;
};


export type QueryRegisteredPlatformsArgs = {
  input?: InputMaybe<RegisteredPlatformsInput>;
};


export type QueryRolePortalArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySeoCustomDashboardsByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoOpenAevScenariosByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoServiceInstanceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryServiceGroupsArgs = {
  serviceInstanceId: Scalars['ID']['input'];
};


export type QueryServiceInstanceByIdArgs = {
  service_instance_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceInstanceByIdWithSubscriptionsArgs = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  service_instance_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceInstanceLinksByTagsArgs = {
  tags: Array<ServiceInstanceTag>;
};


export type QueryServiceInstancesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<ServiceInstanceFilter>>;
  first: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryServiceUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
};


export type QuerySubscribedServiceInstancesByIdentifierArgs = {
  identifier: ServiceDefinitionIdentifier;
};


export type QuerySubscriptionByIdArgs = {
  subscription_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTrialDeploymentsArgs = {
  input?: InputMaybe<TrialDeploymentsInput>;
};


export type QueryUpdateOpenCtiManifestArgs = {
  tag?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUseCasesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  documentType?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UseCaseOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserServiceFromSubscriptionArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
  subscription_id: Scalars['ID']['input'];
};


export type QueryUserServiceOwnedArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersWithCapabilitiesInOrganizationArgs = {
  input: UsersWithCapabilitiesInOrganizationInput;
};

export type RefreshPlatformRegistrationConnectivityStatusInput = {
  platformId: Scalars['String']['input'];
  platformIdentifier?: InputMaybe<PlatformIdentifier>;
  platformVersion: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type RefreshPlatformRegistrationConnectivityStatusResponse = {
  __typename?: 'RefreshPlatformRegistrationConnectivityStatusResponse';
  status: PlatformRegistrationConnectivityStatus;
};

export type RefreshUserPlatformTokenResponse = {
  __typename?: 'RefreshUserPlatformTokenResponse';
  token: Scalars['String']['output'];
};

export type RegisterPlatformInput = {
  identifier: PlatformIdentifier;
  organizationId: Scalars['ID']['input'];
  platform: PlatformInput;
};

export type RegisteredPlatform = Node & {
  __typename?: 'RegisteredPlatform';
  contract: PlatformContract;
  deployment_request?: Maybe<DeploymentRequest>;
  id: Scalars['ID']['output'];
  identifier: ServiceDefinitionIdentifier;
  illustration_document_id?: Maybe<Scalars['String']['output']>;
  platform_id: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type RegisteredPlatformInput = {
  service_instance_id: Scalars['ID']['input'];
};

export type RegisteredPlatformsInput = {
  identifier?: InputMaybe<PlatformIdentifier>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  onlyTrial?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RegistrationResponse = {
  __typename?: 'RegistrationResponse';
  token: Scalars['String']['output'];
};

export enum ReorderDeploymentRequestInQueueDirection {
  Top = 'top',
  Up = 'up'
}

export type ReorderDeploymentRequestInQueueInput = {
  direction: ReorderDeploymentRequestInQueueDirection;
  id: Scalars['ID']['input'];
};

export type RolePortal = Node & {
  __typename?: 'RolePortal';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SendTelemetryMutation = {
  __typename?: 'SendTelemetryMutation';
  oneClickDeploy?: Maybe<TelemetryResponse>;
};


export type SendTelemetryMutationOneClickDeployArgs = {
  input: OneClickDeployInput;
};

export type SeoServiceInstance = Node & {
  __typename?: 'SeoServiceInstance';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  illustration_document_id?: Maybe<Scalars['ID']['output']>;
  links?: Maybe<Array<Maybe<ServiceLink>>>;
  logo_document_id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  service_definition: ServiceDefinition;
  slug?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<ServiceInstanceTag>>;
};

export type ServiceCapability = Node & {
  __typename?: 'ServiceCapability';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_definition_id?: Maybe<Scalars['ID']['output']>;
};

export enum ServiceConfigurationStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export type ServiceConnection = {
  __typename?: 'ServiceConnection';
  edges: Array<ServiceInstanceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ServiceDefinition = Node & {
  __typename?: 'ServiceDefinition';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  identifier: ServiceDefinitionIdentifier;
  name: Scalars['String']['output'];
  public?: Maybe<Scalars['Boolean']['output']>;
  service_capability?: Maybe<Array<Maybe<ServiceCapability>>>;
};

export enum ServiceDefinitionIdentifier {
  Link = 'link',
  OpenaevRegistration = 'openaev_registration',
  OpenaevScenarios = 'openaev_scenarios',
  OpenctiCustomDashboards = 'opencti_custom_dashboards',
  OpenctiIntegrations = 'opencti_integrations',
  OpenctiRegistration = 'opencti_registration',
  Vault = 'vault'
}

export type ServiceGroup = Node & {
  __typename?: 'ServiceGroup';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  users?: Maybe<Array<User>>;
};

export type ServiceInstance = Node & {
  __typename?: 'ServiceInstance';
  capabilities: Array<Maybe<Scalars['String']['output']>>;
  creation_status?: Maybe<ServiceInstanceCreationStatus>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  illustration_document_id?: Maybe<Scalars['ID']['output']>;
  join_type?: Maybe<ServiceInstanceJoinType>;
  links?: Maybe<Array<Maybe<ServiceLink>>>;
  logo_document_id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  ordering: Scalars['Int']['output'];
  organization?: Maybe<Array<Maybe<Organization>>>;
  organization_subscribed?: Maybe<Scalars['Boolean']['output']>;
  public?: Maybe<Scalars['Boolean']['output']>;
  service_definition?: Maybe<ServiceDefinition>;
  slug?: Maybe<Scalars['String']['output']>;
  subscriptions?: Maybe<Array<Maybe<SubscriptionModel>>>;
  tags?: Maybe<Array<ServiceInstanceTag>>;
  user_joined?: Maybe<Scalars['Boolean']['output']>;
};

export enum ServiceInstanceCreationStatus {
  Created = 'CREATED',
  Disabled = 'DISABLED',
  Pending = 'PENDING',
  Ready = 'READY'
}

export type ServiceInstanceEdge = {
  __typename?: 'ServiceInstanceEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ServiceInstance>;
};

export type ServiceInstanceFilter = {
  key?: InputMaybe<ServiceInstanceFilterKey>;
  value: Array<Scalars['String']['input']>;
};

export enum ServiceInstanceFilterKey {
  ServiceDefinitionIdentifier = 'service_definition_identifier',
  Tags = 'tags'
}

export enum ServiceInstanceJoinType {
  JoinAsk = 'JOIN_ASK',
  JoinAuto = 'JOIN_AUTO',
  JoinInvite = 'JOIN_INVITE',
  JoinSelf = 'JOIN_SELF'
}

export enum ServiceInstanceOrdering {
  Description = 'description',
  Name = 'name',
  Ordering = 'ordering'
}

export type ServiceInstanceSubscription = {
  __typename?: 'ServiceInstanceSubscription';
  add?: Maybe<ServiceInstance>;
  delete?: Maybe<ServiceInstance>;
  edit?: Maybe<ServiceInstance>;
};

export enum ServiceInstanceTag {
  OpenAev = 'openAEV',
  OpenCti = 'openCTI',
  Others = 'others',
  Trial = 'trial'
}

export type ServiceLink = Node & {
  __typename?: 'ServiceLink';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_instance_id?: Maybe<Scalars['ID']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum ServiceRestriction {
  AccessUser = 'ACCESS_USER',
  Delete = 'DELETE',
  ManageAccess = 'MANAGE_ACCESS',
  Upload = 'UPLOAD'
}

export type Settings = {
  __typename?: 'Settings';
  base_url_front: Scalars['String']['output'];
  domains_blacklist: Scalars['String']['output'];
  environment: Scalars['String']['output'];
  platform_feature_flags: Array<Scalars['String']['output']>;
  platform_providers: Array<PlatformProvider>;
};

export type ShareableResource = {
  __typename?: 'ShareableResource';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type Stream = Document & Integration & Node & {
  __typename?: 'Stream';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  feed_url?: Maybe<Scalars['String']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type SubscribedServiceInstance = {
  __typename?: 'SubscribedServiceInstance';
  configurations?: Maybe<Array<Maybe<SubscribedServiceInstanceConfiguration>>>;
  is_personal_space: Scalars['Boolean']['output'];
  organization_id: Scalars['ID']['output'];
  service_instance_id: Scalars['ID']['output'];
};

export type SubscribedServiceInstanceConfiguration = {
  __typename?: 'SubscribedServiceInstanceConfiguration';
  platform_contract: PlatformContract;
  platform_id: Scalars['String']['output'];
  platform_title: Scalars['String']['output'];
  platform_url: Scalars['String']['output'];
  registerer_id: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  MeUser?: Maybe<MeUserSubscription>;
  ServiceInstance?: Maybe<ServiceInstanceSubscription>;
  User?: Maybe<UserSubscription>;
  UserPending?: Maybe<UserPendingSubscription>;
};


export type SubscriptionUserArgs = {
  organizationId?: InputMaybe<Scalars['ID']['input']>;
};


export type SubscriptionUserPendingArgs = {
  organizationId: Scalars['ID']['input'];
};

export type SubscriptionCapability = Node & {
  __typename?: 'SubscriptionCapability';
  id: Scalars['ID']['output'];
  service_capability?: Maybe<ServiceCapability>;
};

export type SubscriptionEdge = {
  __typename?: 'SubscriptionEdge';
  cursor: Scalars['String']['output'];
  node: SubscriptionModel;
};

export type SubscriptionModel = Node & {
  __typename?: 'SubscriptionModel';
  end_date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  organization: Organization;
  organization_id: Scalars['ID']['output'];
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['ID']['output'];
  service_url: Scalars['String']['output'];
  start_date?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subscription_capability?: Maybe<Array<Maybe<SubscriptionCapability>>>;
  user_service: Array<Maybe<UserService>>;
};

export enum SubscriptionOrdering {
  EndDate = 'end_date',
  OrganizationName = 'organization_name',
  ServiceDescription = 'service_description',
  ServiceName = 'service_name',
  ServiceProvider = 'service_provider',
  ServiceType = 'service_type',
  StartDate = 'start_date',
  Status = 'status'
}

export type Success = {
  __typename?: 'Success';
  success: Scalars['Boolean']['output'];
};

export type TaxiiFeed = Document & Integration & Node & {
  __typename?: 'TaxiiFeed';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  feed_url?: Maybe<Scalars['String']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
};

export type TelemetryResponse = {
  __typename?: 'TelemetryResponse';
  message?: Maybe<Scalars['String']['output']>;
  result: Scalars['Boolean']['output'];
};

export type ThirdPartyIntegration = Document & Integration & Node & {
  __typename?: 'ThirdPartyIntegration';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name?: Maybe<Scalars['String']['output']>;
  github_url?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number?: Maybe<Scalars['Int']['output']>;
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
  use_cases?: Maybe<Array<UseCase>>;
  vendor_url: Scalars['String']['output'];
};

export type TrialDeploymentsInput = {
  platformIdentifiers?: InputMaybe<Array<PlatformIdentifier>>;
};

export type TrialsDeployments = {
  __typename?: 'TrialsDeployments';
  availableTrials: Array<PlatformIdentifier>;
  deployed: Array<DeployedPlatform>;
  isBlacklisted: Scalars['Boolean']['output'];
};

export type UnregisterPlatformInput = {
  identifier: PlatformIdentifier;
  platformId: Scalars['String']['input'];
};

export type UpdateDeploymentQuotaCapacityInput = {
  newCapacity: Scalars['Int']['input'];
  platformIdentifier: PlatformIdentifier;
  region: DeploymentRequestPlatformRegion;
};

export type UpdateDeploymentRequestInput = {
  actual_state?: InputMaybe<DeploymentRequestPlatformState>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  failure_reason?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  ordering?: InputMaybe<Scalars['Int']['input']>;
  platform_id?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
};

export type UpdateDocumentInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  uploader_id?: InputMaybe<Scalars['String']['input']>;
  uploader_organization_id?: InputMaybe<Scalars['String']['input']>;
  use_cases?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdatePlatformServiceMetadataInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId: Scalars['ID']['input'];
};

export type UpdateServiceGroupsInput = {
  groups: Array<UpdateServiceGroupsInputGroup>;
};

export type UpdateServiceGroupsInputGroup = {
  id: Scalars['ID']['input'];
  userIds: Array<Scalars['ID']['input']>;
};

export type UseCase = Node & {
  __typename?: 'UseCase';
  color: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UseCaseConnection = {
  __typename?: 'UseCaseConnection';
  edges: Array<UseCaseEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UseCaseEdge = {
  __typename?: 'UseCaseEdge';
  cursor: Scalars['String']['output'];
  node: UseCase;
};

export enum UseCaseOrdering {
  Color = 'color',
  Name = 'name'
}

export type User = Node & {
  __typename?: 'User';
  capabilities?: Maybe<Array<Capability>>;
  country?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_login?: Maybe<Scalars['Date']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  organization_capabilities?: Maybe<Array<OrganizationCapabilities>>;
  organizations?: Maybe<Array<Organization>>;
  pending_organization_id?: Maybe<Scalars['ID']['output']>;
  picture?: Maybe<Scalars['String']['output']>;
  roles_portal?: Maybe<Array<RolePortal>>;
  selected_org_capabilities?: Maybe<Array<OrganizationCapability>>;
  selected_organization_id?: Maybe<Scalars['String']['output']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export enum UserOrdering {
  Country = 'country',
  Disabled = 'disabled',
  Email = 'email',
  FirstName = 'first_name',
  LastLogin = 'last_login',
  LastName = 'last_name'
}

export type UserPendingSubscription = {
  __typename?: 'UserPendingSubscription';
  delete?: Maybe<User>;
  invalidate?: Maybe<OrganizationId>;
};

export type UserService = Node & {
  __typename?: 'UserService';
  id: Scalars['ID']['output'];
  ordering?: Maybe<Scalars['Int']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  subscription_id: Scalars['ID']['output'];
  user?: Maybe<User>;
  user_id: Scalars['ID']['output'];
  user_service_capability?: Maybe<Array<Maybe<UserServiceCapability>>>;
};

export type UserServiceAddInput = {
  capabilities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  email: Array<Scalars['String']['input']>;
  subscriptionId?: InputMaybe<Scalars['ID']['input']>;
};

export type UserServiceAddYourselfInput = {
  email: Array<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['ID']['input']>;
};

export type UserServiceCapability = Node & {
  __typename?: 'UserServiceCapability';
  generic_service_capability?: Maybe<GenericServiceCapability>;
  id: Scalars['ID']['output'];
  subscription_capability?: Maybe<SubscriptionCapability>;
  user_service_id: Scalars['ID']['output'];
};

export type UserServiceConnection = {
  __typename?: 'UserServiceConnection';
  edges: Array<UserServiceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserServiceDeleteInput = {
  capabilities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  email: Scalars['String']['input'];
  subscriptionId: Scalars['String']['input'];
};

export type UserServiceDeleted = Node & {
  __typename?: 'UserServiceDeleted';
  id: Scalars['ID']['output'];
  subscription_id: Scalars['ID']['output'];
  user_id: Scalars['ID']['output'];
};

export type UserServiceEdge = {
  __typename?: 'UserServiceEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UserService>;
};

export enum UserServiceOrdering {
  Email = 'email',
  FirstName = 'first_name',
  LastName = 'last_name',
  Ordering = 'ordering',
  ServiceDescription = 'service_description',
  ServiceName = 'service_name',
  ServiceProvider = 'service_provider',
  ServiceType = 'service_type',
  SubscriptionStatus = 'subscription_status'
}

export type UserSubscription = {
  __typename?: 'UserSubscription';
  add?: Maybe<User>;
  delete?: Maybe<User>;
  edit?: Maybe<User>;
  merge?: Maybe<MergeEvent>;
};

export type UsersWithCapabilitiesInOrganizationInput = {
  capabilities: Array<OrganizationCapability>;
  organizationId: Scalars['ID']['input'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Document: ( Connector ) | ( CsvFeed ) | ( CustomDashboard ) | ( DefaultDocument ) | ( IntegrationHack ) | ( OpenAevScenario ) | ( Stream ) | ( TaxiiFeed ) | ( ThirdPartyIntegration );
  Integration: ( Connector ) | ( CsvFeed ) | ( IntegrationHack ) | ( Stream ) | ( TaxiiFeed ) | ( ThirdPartyIntegration );
  Node: ( Capability ) | ( Connector ) | ( CsvFeed ) | ( CustomDashboard ) | ( DefaultDocument ) | ( DeploymentRequest ) | ( GenericServiceCapability ) | ( IntegrationHack ) | ( IsPlatformRegisteredOrganization ) | ( MergeEvent ) | ( OpenAevScenario ) | ( Organization ) | ( OrganizationCapabilities ) | ( OrganizationId ) | ( RegisteredPlatform ) | ( RolePortal ) | ( SeoServiceInstance ) | ( ServiceCapability ) | ( ServiceDefinition ) | ( ServiceGroup ) | ( ServiceInstance ) | ( ServiceLink ) | ( Stream ) | ( SubscriptionCapability ) | ( SubscriptionModel ) | ( TaxiiFeed ) | ( ThirdPartyIntegration ) | ( UseCase ) | ( User ) | ( UserService ) | ( UserServiceCapability ) | ( UserServiceDeleted );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddServiceInput: AddServiceInput;
  AddUseCaseInput: AddUseCaseInput;
  AddUserInput: AddUserInput;
  AdminAddUserInput: AdminAddUserInput;
  AdminEditUserInput: AdminEditUserInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BulkPendingUserFromOrganizationInput: BulkPendingUserFromOrganizationInput;
  CanUnregisterPlatformInput: CanUnregisterPlatformInput;
  CanUnregisterResponse: ResolverTypeWrapper<CanUnregisterResponse>;
  Capability: ResolverTypeWrapper<Capability>;
  Connector: ResolverTypeWrapper<Connector>;
  CreateDeploymentRequestInput: CreateDeploymentRequestInput;
  CreateDocumentInput: CreateDocumentInput;
  CsvFeed: ResolverTypeWrapper<CsvFeed>;
  CustomDashboard: ResolverTypeWrapper<CustomDashboard>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DefaultDocument: ResolverTypeWrapper<DefaultDocument>;
  DeployedPlatform: ResolverTypeWrapper<DeployedPlatform>;
  DeploymentAvailability: ResolverTypeWrapper<DeploymentAvailability>;
  DeploymentRequest: ResolverTypeWrapper<DeploymentRequest>;
  DeploymentRequestConnection: ResolverTypeWrapper<DeploymentRequestConnection>;
  DeploymentRequestDeploymentType: DeploymentRequestDeploymentType;
  DeploymentRequestEdge: ResolverTypeWrapper<DeploymentRequestEdge>;
  DeploymentRequestFilter: DeploymentRequestFilter;
  DeploymentRequestFilterKey: DeploymentRequestFilterKey;
  DeploymentRequestHubStatus: DeploymentRequestHubStatus;
  DeploymentRequestOrdering: DeploymentRequestOrdering;
  DeploymentRequestPlatformRegion: DeploymentRequestPlatformRegion;
  DeploymentRequestPlatformState: DeploymentRequestPlatformState;
  Document: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Document']>;
  DocumentConnection: ResolverTypeWrapper<Omit<DocumentConnection, 'edges'> & { edges: Array<ResolversTypes['DocumentEdge']> }>;
  DocumentEdge: ResolverTypeWrapper<Omit<DocumentEdge, 'node'> & { node: ResolversTypes['Document'] }>;
  DocumentMetadata: DocumentMetadata;
  DocumentOrdering: DocumentOrdering;
  EditMeUserInput: EditMeUserInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUseCaseInput: EditUseCaseInput;
  EditUserCapabilitiesInput: EditUserCapabilitiesInput;
  Filter: Filter;
  FilterKey: FilterKey;
  GenericServiceCapability: ResolverTypeWrapper<GenericServiceCapability>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Integration: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Integration']>;
  IntegrationHack: ResolverTypeWrapper<IntegrationHack>;
  IntegrationSubType: IntegrationSubType;
  IntegrationType: IntegrationType;
  IsPlatformRegisteredInput: IsPlatformRegisteredInput;
  IsPlatformRegisteredOrganization: ResolverTypeWrapper<IsPlatformRegisteredOrganization>;
  IsPlatformRegisteredResponse: ResolverTypeWrapper<IsPlatformRegisteredResponse>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LogicalFilterInput: LogicalFilterInput;
  LogicalOperator: LogicalOperator;
  MeUserSubscription: ResolverTypeWrapper<MeUserSubscription>;
  MergeEvent: ResolverTypeWrapper<MergeEvent>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  OneClickDeployInput: OneClickDeployInput;
  OpenAEVScenario: ResolverTypeWrapper<OpenAevScenario>;
  OpenAEVScenarioConnection: ResolverTypeWrapper<OpenAevScenarioConnection>;
  OpenAEVScenarioEdge: ResolverTypeWrapper<OpenAevScenarioEdge>;
  OpenCTIPlatformRegistrationStatusInput: OpenCtiPlatformRegistrationStatusInput;
  OpenCTIPlatformRegistrationStatusResponse: ResolverTypeWrapper<OpenCtiPlatformRegistrationStatusResponse>;
  OrderingMode: OrderingMode;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationCapabilities: ResolverTypeWrapper<OrganizationCapabilities>;
  OrganizationCapabilitiesInput: OrganizationCapabilitiesInput;
  OrganizationCapability: OrganizationCapability;
  OrganizationConnection: ResolverTypeWrapper<OrganizationConnection>;
  OrganizationEdge: ResolverTypeWrapper<OrganizationEdge>;
  OrganizationId: ResolverTypeWrapper<OrganizationId>;
  OrganizationInput: OrganizationInput;
  OrganizationOrdering: OrganizationOrdering;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PlatformContract: PlatformContract;
  PlatformDeploymentRequest: ResolverTypeWrapper<PlatformDeploymentRequest>;
  PlatformDeploymentRequestConnection: ResolverTypeWrapper<PlatformDeploymentRequestConnection>;
  PlatformDeploymentRequestEdge: ResolverTypeWrapper<PlatformDeploymentRequestEdge>;
  PlatformIdentifier: PlatformIdentifier;
  PlatformInput: PlatformInput;
  PlatformProvider: ResolverTypeWrapper<PlatformProvider>;
  PlatformRegistrationConnectivityStatus: PlatformRegistrationConnectivityStatus;
  PlatformRegistrationStatus: PlatformRegistrationStatus;
  PortalCapability: PortalCapability;
  Query: ResolverTypeWrapper<{}>;
  RefreshPlatformRegistrationConnectivityStatusInput: RefreshPlatformRegistrationConnectivityStatusInput;
  RefreshPlatformRegistrationConnectivityStatusResponse: ResolverTypeWrapper<RefreshPlatformRegistrationConnectivityStatusResponse>;
  RefreshUserPlatformTokenResponse: ResolverTypeWrapper<RefreshUserPlatformTokenResponse>;
  RegisterPlatformInput: RegisterPlatformInput;
  RegisteredPlatform: ResolverTypeWrapper<RegisteredPlatform>;
  RegisteredPlatformInput: RegisteredPlatformInput;
  RegisteredPlatformsInput: RegisteredPlatformsInput;
  RegistrationResponse: ResolverTypeWrapper<RegistrationResponse>;
  ReorderDeploymentRequestInQueueDirection: ReorderDeploymentRequestInQueueDirection;
  ReorderDeploymentRequestInQueueInput: ReorderDeploymentRequestInQueueInput;
  RolePortal: ResolverTypeWrapper<RolePortal>;
  SendTelemetryMutation: ResolverTypeWrapper<SendTelemetryMutation>;
  SeoServiceInstance: ResolverTypeWrapper<SeoServiceInstance>;
  ServiceCapability: ResolverTypeWrapper<ServiceCapability>;
  ServiceConfigurationStatus: ServiceConfigurationStatus;
  ServiceConnection: ResolverTypeWrapper<ServiceConnection>;
  ServiceDefinition: ResolverTypeWrapper<ServiceDefinition>;
  ServiceDefinitionIdentifier: ServiceDefinitionIdentifier;
  ServiceGroup: ResolverTypeWrapper<ServiceGroup>;
  ServiceInstance: ResolverTypeWrapper<ServiceInstance>;
  ServiceInstanceCreationStatus: ServiceInstanceCreationStatus;
  ServiceInstanceEdge: ResolverTypeWrapper<ServiceInstanceEdge>;
  ServiceInstanceFilter: ServiceInstanceFilter;
  ServiceInstanceFilterKey: ServiceInstanceFilterKey;
  ServiceInstanceJoinType: ServiceInstanceJoinType;
  ServiceInstanceOrdering: ServiceInstanceOrdering;
  ServiceInstanceSubscription: ResolverTypeWrapper<ServiceInstanceSubscription>;
  ServiceInstanceTag: ServiceInstanceTag;
  ServiceLink: ResolverTypeWrapper<ServiceLink>;
  ServiceRestriction: ServiceRestriction;
  Settings: ResolverTypeWrapper<Settings>;
  ShareableResource: ResolverTypeWrapper<ShareableResource>;
  Stream: ResolverTypeWrapper<Stream>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubscribedServiceInstance: ResolverTypeWrapper<SubscribedServiceInstance>;
  SubscribedServiceInstanceConfiguration: ResolverTypeWrapper<SubscribedServiceInstanceConfiguration>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionCapability: ResolverTypeWrapper<SubscriptionCapability>;
  SubscriptionEdge: ResolverTypeWrapper<SubscriptionEdge>;
  SubscriptionModel: ResolverTypeWrapper<SubscriptionModel>;
  SubscriptionOrdering: SubscriptionOrdering;
  Success: ResolverTypeWrapper<Success>;
  TaxiiFeed: ResolverTypeWrapper<TaxiiFeed>;
  TelemetryResponse: ResolverTypeWrapper<TelemetryResponse>;
  ThirdPartyIntegration: ResolverTypeWrapper<ThirdPartyIntegration>;
  TrialDeploymentsInput: TrialDeploymentsInput;
  TrialsDeployments: ResolverTypeWrapper<TrialsDeployments>;
  UnregisterPlatformInput: UnregisterPlatformInput;
  UpdateDeploymentQuotaCapacityInput: UpdateDeploymentQuotaCapacityInput;
  UpdateDeploymentRequestInput: UpdateDeploymentRequestInput;
  UpdateDocumentInput: UpdateDocumentInput;
  UpdatePlatformServiceMetadataInput: UpdatePlatformServiceMetadataInput;
  UpdateServiceGroupsInput: UpdateServiceGroupsInput;
  UpdateServiceGroupsInputGroup: UpdateServiceGroupsInputGroup;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  UseCase: ResolverTypeWrapper<UseCase>;
  UseCaseConnection: ResolverTypeWrapper<UseCaseConnection>;
  UseCaseEdge: ResolverTypeWrapper<UseCaseEdge>;
  UseCaseOrdering: UseCaseOrdering;
  User: ResolverTypeWrapper<User>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserOrdering: UserOrdering;
  UserPendingSubscription: ResolverTypeWrapper<UserPendingSubscription>;
  UserService: ResolverTypeWrapper<UserService>;
  UserServiceAddInput: UserServiceAddInput;
  UserServiceAddYourselfInput: UserServiceAddYourselfInput;
  UserServiceCapability: ResolverTypeWrapper<UserServiceCapability>;
  UserServiceConnection: ResolverTypeWrapper<UserServiceConnection>;
  UserServiceDeleteInput: UserServiceDeleteInput;
  UserServiceDeleted: ResolverTypeWrapper<UserServiceDeleted>;
  UserServiceEdge: ResolverTypeWrapper<UserServiceEdge>;
  UserServiceOrdering: UserServiceOrdering;
  UserSubscription: ResolverTypeWrapper<UserSubscription>;
  UsersWithCapabilitiesInOrganizationInput: UsersWithCapabilitiesInOrganizationInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddServiceInput: AddServiceInput;
  AddUseCaseInput: AddUseCaseInput;
  AddUserInput: AddUserInput;
  AdminAddUserInput: AdminAddUserInput;
  AdminEditUserInput: AdminEditUserInput;
  Boolean: Scalars['Boolean']['output'];
  BulkPendingUserFromOrganizationInput: BulkPendingUserFromOrganizationInput;
  CanUnregisterPlatformInput: CanUnregisterPlatformInput;
  CanUnregisterResponse: CanUnregisterResponse;
  Capability: Capability;
  Connector: Connector;
  CreateDeploymentRequestInput: CreateDeploymentRequestInput;
  CreateDocumentInput: CreateDocumentInput;
  CsvFeed: CsvFeed;
  CustomDashboard: CustomDashboard;
  Date: Scalars['Date']['output'];
  DefaultDocument: DefaultDocument;
  DeployedPlatform: DeployedPlatform;
  DeploymentAvailability: DeploymentAvailability;
  DeploymentRequest: DeploymentRequest;
  DeploymentRequestConnection: DeploymentRequestConnection;
  DeploymentRequestEdge: DeploymentRequestEdge;
  DeploymentRequestFilter: DeploymentRequestFilter;
  Document: ResolversInterfaceTypes<ResolversParentTypes>['Document'];
  DocumentConnection: Omit<DocumentConnection, 'edges'> & { edges: Array<ResolversParentTypes['DocumentEdge']> };
  DocumentEdge: Omit<DocumentEdge, 'node'> & { node: ResolversParentTypes['Document'] };
  DocumentMetadata: DocumentMetadata;
  EditMeUserInput: EditMeUserInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUseCaseInput: EditUseCaseInput;
  EditUserCapabilitiesInput: EditUserCapabilitiesInput;
  Filter: Filter;
  GenericServiceCapability: GenericServiceCapability;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Integration: ResolversInterfaceTypes<ResolversParentTypes>['Integration'];
  IntegrationHack: IntegrationHack;
  IsPlatformRegisteredInput: IsPlatformRegisteredInput;
  IsPlatformRegisteredOrganization: IsPlatformRegisteredOrganization;
  IsPlatformRegisteredResponse: IsPlatformRegisteredResponse;
  JSON: Scalars['JSON']['output'];
  LogicalFilterInput: LogicalFilterInput;
  MeUserSubscription: MeUserSubscription;
  MergeEvent: MergeEvent;
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  OneClickDeployInput: OneClickDeployInput;
  OpenAEVScenario: OpenAevScenario;
  OpenAEVScenarioConnection: OpenAevScenarioConnection;
  OpenAEVScenarioEdge: OpenAevScenarioEdge;
  OpenCTIPlatformRegistrationStatusInput: OpenCtiPlatformRegistrationStatusInput;
  OpenCTIPlatformRegistrationStatusResponse: OpenCtiPlatformRegistrationStatusResponse;
  Organization: Organization;
  OrganizationCapabilities: OrganizationCapabilities;
  OrganizationCapabilitiesInput: OrganizationCapabilitiesInput;
  OrganizationConnection: OrganizationConnection;
  OrganizationEdge: OrganizationEdge;
  OrganizationId: OrganizationId;
  OrganizationInput: OrganizationInput;
  PageInfo: PageInfo;
  PlatformDeploymentRequest: PlatformDeploymentRequest;
  PlatformDeploymentRequestConnection: PlatformDeploymentRequestConnection;
  PlatformDeploymentRequestEdge: PlatformDeploymentRequestEdge;
  PlatformInput: PlatformInput;
  PlatformProvider: PlatformProvider;
  Query: {};
  RefreshPlatformRegistrationConnectivityStatusInput: RefreshPlatformRegistrationConnectivityStatusInput;
  RefreshPlatformRegistrationConnectivityStatusResponse: RefreshPlatformRegistrationConnectivityStatusResponse;
  RefreshUserPlatformTokenResponse: RefreshUserPlatformTokenResponse;
  RegisterPlatformInput: RegisterPlatformInput;
  RegisteredPlatform: RegisteredPlatform;
  RegisteredPlatformInput: RegisteredPlatformInput;
  RegisteredPlatformsInput: RegisteredPlatformsInput;
  RegistrationResponse: RegistrationResponse;
  ReorderDeploymentRequestInQueueInput: ReorderDeploymentRequestInQueueInput;
  RolePortal: RolePortal;
  SendTelemetryMutation: SendTelemetryMutation;
  SeoServiceInstance: SeoServiceInstance;
  ServiceCapability: ServiceCapability;
  ServiceConnection: ServiceConnection;
  ServiceDefinition: ServiceDefinition;
  ServiceGroup: ServiceGroup;
  ServiceInstance: ServiceInstance;
  ServiceInstanceEdge: ServiceInstanceEdge;
  ServiceInstanceFilter: ServiceInstanceFilter;
  ServiceInstanceSubscription: ServiceInstanceSubscription;
  ServiceLink: ServiceLink;
  Settings: Settings;
  ShareableResource: ShareableResource;
  Stream: Stream;
  String: Scalars['String']['output'];
  SubscribedServiceInstance: SubscribedServiceInstance;
  SubscribedServiceInstanceConfiguration: SubscribedServiceInstanceConfiguration;
  Subscription: {};
  SubscriptionCapability: SubscriptionCapability;
  SubscriptionEdge: SubscriptionEdge;
  SubscriptionModel: SubscriptionModel;
  Success: Success;
  TaxiiFeed: TaxiiFeed;
  TelemetryResponse: TelemetryResponse;
  ThirdPartyIntegration: ThirdPartyIntegration;
  TrialDeploymentsInput: TrialDeploymentsInput;
  TrialsDeployments: TrialsDeployments;
  UnregisterPlatformInput: UnregisterPlatformInput;
  UpdateDeploymentQuotaCapacityInput: UpdateDeploymentQuotaCapacityInput;
  UpdateDeploymentRequestInput: UpdateDeploymentRequestInput;
  UpdateDocumentInput: UpdateDocumentInput;
  UpdatePlatformServiceMetadataInput: UpdatePlatformServiceMetadataInput;
  UpdateServiceGroupsInput: UpdateServiceGroupsInput;
  UpdateServiceGroupsInputGroup: UpdateServiceGroupsInputGroup;
  Upload: Scalars['Upload']['output'];
  UseCase: UseCase;
  UseCaseConnection: UseCaseConnection;
  UseCaseEdge: UseCaseEdge;
  User: User;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserPendingSubscription: UserPendingSubscription;
  UserService: UserService;
  UserServiceAddInput: UserServiceAddInput;
  UserServiceAddYourselfInput: UserServiceAddYourselfInput;
  UserServiceCapability: UserServiceCapability;
  UserServiceConnection: UserServiceConnection;
  UserServiceDeleteInput: UserServiceDeleteInput;
  UserServiceDeleted: UserServiceDeleted;
  UserServiceEdge: UserServiceEdge;
  UserSubscription: UserSubscription;
  UsersWithCapabilitiesInOrganizationInput: UsersWithCapabilitiesInOrganizationInput;
}>;

export type AuthDirectiveArgs = {
  orgaCapa?: Maybe<Array<Maybe<OrganizationCapability>>>;
  portalCapa?: Maybe<Array<Maybe<PortalCapability>>>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Platform_TokenDirectiveArgs = { };

export type Platform_TokenDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = Platform_TokenDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Service_CapaDirectiveArgs = {
  requires?: Maybe<Array<Maybe<ServiceRestriction>>>;
};

export type Service_CapaDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = Service_CapaDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type System_TokenDirectiveArgs = { };

export type System_TokenDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = System_TokenDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CanUnregisterResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CanUnregisterResponse'] = ResolversParentTypes['CanUnregisterResponse']> = ResolversObject<{
  isAllowed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isInOrganization?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPlatformRegistered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organizationId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PortalCapability'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ConnectorResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Connector'] = ResolversParentTypes['Connector']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  container_image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_subtype?: Resolver<ResolversTypes['IntegrationSubType'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  manager_supported?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  playbook_supported?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  source_code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  subscription_link?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CsvFeedResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CsvFeed'] = ResolversParentTypes['CsvFeed']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  feed_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomDashboardResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CustomDashboard'] = ResolversParentTypes['CustomDashboard']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DefaultDocumentResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DefaultDocument'] = ResolversParentTypes['DefaultDocument']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeployedPlatformResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DeployedPlatform'] = ResolversParentTypes['DeployedPlatform']> = ResolversObject<{
  platformIdentifier?: Resolver<ResolversTypes['PlatformIdentifier'], ParentType, ContextType>;
  serviceInstanceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeploymentAvailabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DeploymentAvailability'] = ResolversParentTypes['DeploymentAvailability']> = ResolversObject<{
  availableCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  capacity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  platform_identifier?: Resolver<ResolversTypes['PlatformIdentifier'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['DeploymentRequestPlatformRegion'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeploymentRequestResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DeploymentRequest'] = ResolversParentTypes['DeploymentRequest']> = ResolversObject<{
  activity_sector?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancellation_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  cancellation_reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancellation_user_email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  counts_in_orga_quota?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  hub_status?: Resolver<ResolversTypes['DeploymentRequestHubStatus'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  job_title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordering?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  platform_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  platform_identifier?: Resolver<ResolversTypes['PlatformIdentifier'], ParentType, ContextType>;
  platform_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<ResolversTypes['DeploymentRequestPlatformRegion'], ParentType, ContextType>;
  request_date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  requester_email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DeploymentRequestDeploymentType'], ParentType, ContextType>;
  use_case?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeploymentRequestConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DeploymentRequestConnection'] = ResolversParentTypes['DeploymentRequestConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['DeploymentRequestEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeploymentRequestEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DeploymentRequestEdge'] = ResolversParentTypes['DeploymentRequestEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['DeploymentRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DocumentResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Connector' | 'CsvFeed' | 'CustomDashboard' | 'DefaultDocument' | 'IntegrationHack' | 'OpenAEVScenario' | 'Stream' | 'TaxiiFeed' | 'ThirdPartyIntegration', ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
}>;

export type DocumentConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DocumentConnection'] = ResolversParentTypes['DocumentConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['DocumentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DocumentEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['DocumentEdge'] = ResolversParentTypes['DocumentEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Document'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GenericServiceCapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['GenericServiceCapability'] = ResolversParentTypes['GenericServiceCapability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IntegrationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Integration'] = ResolversParentTypes['Integration']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Connector' | 'CsvFeed' | 'IntegrationHack' | 'Stream' | 'TaxiiFeed' | 'ThirdPartyIntegration', ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
}>;

export type IntegrationHackResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['IntegrationHack'] = ResolversParentTypes['IntegrationHack']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IsPlatformRegisteredOrganizationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['IsPlatformRegisteredOrganization'] = ResolversParentTypes['IsPlatformRegisteredOrganization']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IsPlatformRegisteredResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['IsPlatformRegisteredResponse'] = ResolversParentTypes['IsPlatformRegisteredResponse']> = ResolversObject<{
  organization?: Resolver<Maybe<ResolversTypes['IsPlatformRegisteredOrganization']>, ParentType, ContextType>;
  platformTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PlatformRegistrationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MeUserSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['MeUserSubscription'] = ResolversParentTypes['MeUserSubscription']> = ResolversObject<{
  delete?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MergeEventResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['MergeEvent'] = ResolversParentTypes['MergeEvent']> = ResolversObject<{
  from?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationAddOrganizationArgs, 'input'>>;
  addServicePicture?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationAddServicePictureArgs, 'serviceInstanceId'>>;
  addSubscription?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<MutationAddSubscriptionArgs>>;
  addSubscriptionInService?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<MutationAddSubscriptionInServiceArgs>>;
  addUseCase?: Resolver<ResolversTypes['UseCase'], ParentType, ContextType, RequireFields<MutationAddUseCaseArgs, 'input'>>;
  addUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddUserArgs, 'input'>>;
  addUserService?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserService']>>>, ParentType, ContextType, RequireFields<MutationAddUserServiceArgs, 'input'>>;
  addYourselfInUserService?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserService']>>>, ParentType, ContextType, RequireFields<MutationAddYourselfInUserServiceArgs, 'input'>>;
  adminAddUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAdminAddUserArgs, 'input'>>;
  adminCancelDeploymentRequest?: Resolver<Maybe<ResolversTypes['DeploymentRequest']>, ParentType, ContextType, Partial<MutationAdminCancelDeploymentRequestArgs>>;
  adminEditUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAdminEditUserArgs, 'id' | 'input'>>;
  autoRegisterPlatform?: Resolver<ResolversTypes['Success'], ParentType, ContextType, RequireFields<MutationAutoRegisterPlatformArgs, 'platform'>>;
  bulkAcceptPendingUserInOrganization?: Resolver<Maybe<ResolversTypes['Success']>, ParentType, ContextType, Partial<MutationBulkAcceptPendingUserInOrganizationArgs>>;
  bulkRemovePendingUserFromOrganization?: Resolver<Maybe<ResolversTypes['Success']>, ParentType, ContextType, Partial<MutationBulkRemovePendingUserFromOrganizationArgs>>;
  cancelDeploymentRequest?: Resolver<Maybe<ResolversTypes['DeploymentRequest']>, ParentType, ContextType, RequireFields<MutationCancelDeploymentRequestArgs, 'deploymentRequestId'>>;
  changeSelectedOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationChangeSelectedOrganizationArgs, 'organization_id'>>;
  contactUs?: Resolver<ResolversTypes['Success'], ParentType, ContextType, Partial<MutationContactUsArgs>>;
  createDeploymentRequest?: Resolver<ResolversTypes['DeploymentRequest'], ParentType, ContextType, Partial<MutationCreateDeploymentRequestArgs>>;
  createDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationCreateDocumentArgs, 'document' | 'input' | 'metadata'>>;
  deleteDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationDeleteDocumentArgs>>;
  deleteOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationDeleteOrganizationArgs, 'id'>>;
  deleteSubscription?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationDeleteSubscriptionArgs, 'subscription_id'>>;
  deleteUseCase?: Resolver<ResolversTypes['UseCase'], ParentType, ContextType, RequireFields<MutationDeleteUseCaseArgs, 'id'>>;
  deleteUserService?: Resolver<Maybe<ResolversTypes['UserService']>, ParentType, ContextType, RequireFields<MutationDeleteUserServiceArgs, 'input'>>;
  editMeUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditMeUserArgs, 'input'>>;
  editOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationEditOrganizationArgs, 'id' | 'input'>>;
  editServiceCapability?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType, Partial<MutationEditServiceCapabilityArgs>>;
  editUseCase?: Resolver<ResolversTypes['UseCase'], ParentType, ContextType, RequireFields<MutationEditUseCaseArgs, 'id' | 'input'>>;
  editUserCapabilities?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditUserCapabilitiesArgs, 'id' | 'input'>>;
  frontendErrorLog?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationFrontendErrorLogArgs, 'message'>>;
  incrementShareNumberDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationIncrementShareNumberDocumentArgs>>;
  login?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email'>>;
  logout?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mergeTest?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationMergeTestArgs, 'from' | 'target'>>;
  refreshPlatformRegistrationConnectivityStatus?: Resolver<ResolversTypes['RefreshPlatformRegistrationConnectivityStatusResponse'], ParentType, ContextType, RequireFields<MutationRefreshPlatformRegistrationConnectivityStatusArgs, 'input'>>;
  refreshUserPlatformToken?: Resolver<ResolversTypes['RefreshUserPlatformTokenResponse'], ParentType, ContextType>;
  registerPlatform?: Resolver<ResolversTypes['RegistrationResponse'], ParentType, ContextType, RequireFields<MutationRegisterPlatformArgs, 'input'>>;
  removePendingUserFromOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemovePendingUserFromOrganizationArgs, 'organization_id' | 'user_id'>>;
  removeUserFromOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromOrganizationArgs, 'organization_id' | 'user_id'>>;
  reorderDeploymentRequestInQueue?: Resolver<ResolversTypes['Success'], ParentType, ContextType, RequireFields<MutationReorderDeploymentRequestInQueueArgs, 'input'>>;
  requestTransferPersonalSpace?: Resolver<ResolversTypes['Success'], ParentType, ContextType, Partial<MutationRequestTransferPersonalSpaceArgs>>;
  resetPassword?: Resolver<ResolversTypes['Success'], ParentType, ContextType>;
  sendTelemetryEvent?: Resolver<Maybe<ResolversTypes['SendTelemetryMutation']>, ParentType, ContextType>;
  transferPersonalSpace?: Resolver<ResolversTypes['Success'], ParentType, ContextType, RequireFields<MutationTransferPersonalSpaceArgs, 'requestId'>>;
  unregisterPlatform?: Resolver<ResolversTypes['Success'], ParentType, ContextType, Partial<MutationUnregisterPlatformArgs>>;
  updateDeploymentQuotaCapacity?: Resolver<ResolversTypes['Success'], ParentType, ContextType, RequireFields<MutationUpdateDeploymentQuotaCapacityArgs, 'input'>>;
  updateDeploymentRequest?: Resolver<ResolversTypes['PlatformDeploymentRequest'], ParentType, ContextType, RequireFields<MutationUpdateDeploymentRequestArgs, 'input'>>;
  updateDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationUpdateDocumentArgs, 'document' | 'documentId' | 'input' | 'metadata' | 'updateDocument'>>;
  updatePlatformServiceMetadata?: Resolver<Maybe<ResolversTypes['RegisteredPlatform']>, ParentType, ContextType, RequireFields<MutationUpdatePlatformServiceMetadataArgs, 'input'>>;
  updateServiceGroups?: Resolver<Maybe<ResolversTypes['Success']>, ParentType, ContextType, RequireFields<MutationUpdateServiceGroupsArgs, 'input'>>;
}>;

export type NodeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Capability' | 'Connector' | 'CsvFeed' | 'CustomDashboard' | 'DefaultDocument' | 'DeploymentRequest' | 'GenericServiceCapability' | 'IntegrationHack' | 'IsPlatformRegisteredOrganization' | 'MergeEvent' | 'OpenAEVScenario' | 'Organization' | 'OrganizationCapabilities' | 'OrganizationId' | 'RegisteredPlatform' | 'RolePortal' | 'SeoServiceInstance' | 'ServiceCapability' | 'ServiceDefinition' | 'ServiceGroup' | 'ServiceInstance' | 'ServiceLink' | 'Stream' | 'SubscriptionCapability' | 'SubscriptionModel' | 'TaxiiFeed' | 'ThirdPartyIntegration' | 'UseCase' | 'User' | 'UserService' | 'UserServiceCapability' | 'UserServiceDeleted', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type OpenAevScenarioResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenAEVScenario'] = ResolversParentTypes['OpenAEVScenario']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OpenAevScenarioConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenAEVScenarioConnection'] = ResolversParentTypes['OpenAEVScenarioConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['OpenAEVScenarioEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OpenAevScenarioEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenAEVScenarioEdge'] = ResolversParentTypes['OpenAEVScenarioEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['OpenAEVScenario'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OpenCtiPlatformRegistrationStatusResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenCTIPlatformRegistrationStatusResponse'] = ResolversParentTypes['OpenCTIPlatformRegistrationStatusResponse']> = ResolversObject<{
  status?: Resolver<ResolversTypes['PlatformRegistrationConnectivityStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = ResolversObject<{
  capabilityUser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Capability']>>>, ParentType, ContextType>;
  domains?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personal_space?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationCapabilitiesResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OrganizationCapabilities'] = ResolversParentTypes['OrganizationCapabilities']> = ResolversObject<{
  capabilities?: Resolver<Maybe<Array<ResolversTypes['OrganizationCapability']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OrganizationConnection'] = ResolversParentTypes['OrganizationConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['OrganizationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OrganizationEdge'] = ResolversParentTypes['OrganizationEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationIdResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OrganizationId'] = ResolversParentTypes['OrganizationId']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformDeploymentRequestResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PlatformDeploymentRequest'] = ResolversParentTypes['PlatformDeploymentRequest']> = ResolversObject<{
  activity_sector?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  actual_state?: Resolver<Maybe<ResolversTypes['DeploymentRequestPlatformState']>, ParentType, ContextType>;
  end_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  failure_reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hub_status?: Resolver<ResolversTypes['DeploymentRequestHubStatus'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  job_title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ordering?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization_domains?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  organization_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  platform_identifier?: Resolver<ResolversTypes['PlatformIdentifier'], ParentType, ContextType>;
  platform_token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<ResolversTypes['DeploymentRequestPlatformRegion'], ParentType, ContextType>;
  requester_email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requester_first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requester_last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  target_state?: Resolver<Maybe<ResolversTypes['DeploymentRequestPlatformState']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DeploymentRequestDeploymentType'], ParentType, ContextType>;
  use_case?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformDeploymentRequestConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PlatformDeploymentRequestConnection'] = ResolversParentTypes['PlatformDeploymentRequestConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['PlatformDeploymentRequestEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformDeploymentRequestEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PlatformDeploymentRequestEdge'] = ResolversParentTypes['PlatformDeploymentRequestEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['PlatformDeploymentRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformProviderResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PlatformProvider'] = ResolversParentTypes['PlatformProvider']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  canUnregisterPlatform?: Resolver<ResolversTypes['CanUnregisterResponse'], ParentType, ContextType, RequireFields<QueryCanUnregisterPlatformArgs, 'input'>>;
  deploymentRequests?: Resolver<ResolversTypes['PlatformDeploymentRequestConnection'], ParentType, ContextType, RequireFields<QueryDeploymentRequestsArgs, 'first'>>;
  deploymentRequestsAvailable?: Resolver<Array<ResolversTypes['DeploymentAvailability']>, ParentType, ContextType, Partial<QueryDeploymentRequestsAvailableArgs>>;
  deploymentRequestsList?: Resolver<ResolversTypes['DeploymentRequestConnection'], ParentType, ContextType, RequireFields<QueryDeploymentRequestsListArgs, 'first' | 'orderBy' | 'orderMode'>>;
  document?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType, Partial<QueryDocumentArgs>>;
  documentExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, Partial<QueryDocumentExistsArgs>>;
  documents?: Resolver<ResolversTypes['DocumentConnection'], ParentType, ContextType, RequireFields<QueryDocumentsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  isPlatformRegistered?: Resolver<ResolversTypes['IsPlatformRegisteredResponse'], ParentType, ContextType, RequireFields<QueryIsPlatformRegisteredArgs, 'input'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  openCTIPlatformRegistrationStatus?: Resolver<ResolversTypes['OpenCTIPlatformRegistrationStatusResponse'], ParentType, ContextType, RequireFields<QueryOpenCtiPlatformRegistrationStatusArgs, 'input'>>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryOrganizationArgs, 'id'>>;
  organizations?: Resolver<ResolversTypes['OrganizationConnection'], ParentType, ContextType, RequireFields<QueryOrganizationsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  pendingUsers?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryPendingUsersArgs, 'first' | 'orderBy' | 'orderMode'>>;
  platformAssociatedOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryPlatformAssociatedOrganizationArgs, 'platformId'>>;
  publicDocumentBySlug?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType, RequireFields<QueryPublicDocumentBySlugArgs, 'serviceInstanceId' | 'slug'>>;
  publicDocuments?: Resolver<ResolversTypes['DocumentConnection'], ParentType, ContextType, RequireFields<QueryPublicDocumentsArgs, 'first' | 'orderBy' | 'orderMode' | 'serviceInstanceId' | 'slug'>>;
  publicIntegrationsByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['Integration']>>>, ParentType, ContextType, Partial<QueryPublicIntegrationsByServiceSlugArgs>>;
  publicServiceInstances?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryPublicServiceInstancesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  registeredPlatform?: Resolver<Maybe<ResolversTypes['RegisteredPlatform']>, ParentType, ContextType, RequireFields<QueryRegisteredPlatformArgs, 'input'>>;
  registeredPlatforms?: Resolver<Array<ResolversTypes['RegisteredPlatform']>, ParentType, ContextType, Partial<QueryRegisteredPlatformsArgs>>;
  rolePortal?: Resolver<Maybe<ResolversTypes['RolePortal']>, ParentType, ContextType, RequireFields<QueryRolePortalArgs, 'id'>>;
  rolesPortal?: Resolver<Array<ResolversTypes['RolePortal']>, ParentType, ContextType>;
  seoCustomDashboardsByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomDashboard']>>>, ParentType, ContextType, Partial<QuerySeoCustomDashboardsByServiceSlugArgs>>;
  seoOpenAEVScenariosByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['OpenAEVScenario']>>>, ParentType, ContextType, Partial<QuerySeoOpenAevScenariosByServiceSlugArgs>>;
  seoServiceInstance?: Resolver<ResolversTypes['SeoServiceInstance'], ParentType, ContextType, RequireFields<QuerySeoServiceInstanceArgs, 'slug'>>;
  seoServiceInstances?: Resolver<Array<ResolversTypes['SeoServiceInstance']>, ParentType, ContextType>;
  serviceGroups?: Resolver<Array<ResolversTypes['ServiceGroup']>, ParentType, ContextType, RequireFields<QueryServiceGroupsArgs, 'serviceInstanceId'>>;
  serviceInstanceById?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<QueryServiceInstanceByIdArgs>>;
  serviceInstanceByIdWithSubscriptions?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<QueryServiceInstanceByIdWithSubscriptionsArgs>>;
  serviceInstanceLinksByTags?: Resolver<Array<ResolversTypes['SeoServiceInstance']>, ParentType, ContextType, RequireFields<QueryServiceInstanceLinksByTagsArgs, 'tags'>>;
  serviceInstances?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryServiceInstancesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  serviceUsers?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryServiceUsersArgs, 'first' | 'id' | 'orderBy' | 'orderMode'>>;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
  subscribedServiceInstancesByIdentifier?: Resolver<Array<ResolversTypes['SubscribedServiceInstance']>, ParentType, ContextType, RequireFields<QuerySubscribedServiceInstancesByIdentifierArgs, 'identifier'>>;
  subscriptionById?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType, Partial<QuerySubscriptionByIdArgs>>;
  trialDeployments?: Resolver<ResolversTypes['TrialsDeployments'], ParentType, ContextType, Partial<QueryTrialDeploymentsArgs>>;
  updateOpenCTIManifest?: Resolver<ResolversTypes['Success'], ParentType, ContextType, Partial<QueryUpdateOpenCtiManifestArgs>>;
  useCases?: Resolver<Maybe<ResolversTypes['UseCaseConnection']>, ParentType, ContextType, RequireFields<QueryUseCasesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  userHasOrganizationWithSubscription?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userOrganizations?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  userServiceFromSubscription?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryUserServiceFromSubscriptionArgs, 'first' | 'orderBy' | 'orderMode' | 'subscription_id'>>;
  userServiceOwned?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryUserServiceOwnedArgs, 'first' | 'orderBy' | 'orderMode'>>;
  users?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'first' | 'orderBy' | 'orderMode'>>;
  usersWithCapabilitiesInOrganization?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUsersWithCapabilitiesInOrganizationArgs, 'input'>>;
}>;

export type RefreshPlatformRegistrationConnectivityStatusResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RefreshPlatformRegistrationConnectivityStatusResponse'] = ResolversParentTypes['RefreshPlatformRegistrationConnectivityStatusResponse']> = ResolversObject<{
  status?: Resolver<ResolversTypes['PlatformRegistrationConnectivityStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RefreshUserPlatformTokenResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RefreshUserPlatformTokenResponse'] = ResolversParentTypes['RefreshUserPlatformTokenResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RegisteredPlatformResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RegisteredPlatform'] = ResolversParentTypes['RegisteredPlatform']> = ResolversObject<{
  contract?: Resolver<ResolversTypes['PlatformContract'], ParentType, ContextType>;
  deployment_request?: Resolver<Maybe<ResolversTypes['DeploymentRequest']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  identifier?: Resolver<ResolversTypes['ServiceDefinitionIdentifier'], ParentType, ContextType>;
  illustration_document_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  platform_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RegistrationResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RegistrationResponse'] = ResolversParentTypes['RegistrationResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RolePortalResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RolePortal'] = ResolversParentTypes['RolePortal']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SendTelemetryMutationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SendTelemetryMutation'] = ResolversParentTypes['SendTelemetryMutation']> = ResolversObject<{
  oneClickDeploy?: Resolver<Maybe<ResolversTypes['TelemetryResponse']>, ParentType, ContextType, RequireFields<SendTelemetryMutationOneClickDeployArgs, 'input'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SeoServiceInstanceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SeoServiceInstance'] = ResolversParentTypes['SeoServiceInstance']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  illustration_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceLink']>>>, ParentType, ContextType>;
  logo_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  service_definition?: Resolver<ResolversTypes['ServiceDefinition'], ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['ServiceInstanceTag']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceCapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceCapability'] = ResolversParentTypes['ServiceCapability']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_definition_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceConnection'] = ResolversParentTypes['ServiceConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ServiceInstanceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceDefinitionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceDefinition'] = ResolversParentTypes['ServiceDefinition']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  identifier?: Resolver<ResolversTypes['ServiceDefinitionIdentifier'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  public?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  service_capability?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceCapability']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceGroupResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceGroup'] = ResolversParentTypes['ServiceGroup']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceInstanceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceInstance'] = ResolversParentTypes['ServiceInstance']> = ResolversObject<{
  capabilities?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  creation_status?: Resolver<Maybe<ResolversTypes['ServiceInstanceCreationStatus']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  illustration_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  join_type?: Resolver<Maybe<ResolversTypes['ServiceInstanceJoinType']>, ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceLink']>>>, ParentType, ContextType>;
  logo_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ordering?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization?: Resolver<Maybe<Array<Maybe<ResolversTypes['Organization']>>>, ParentType, ContextType>;
  organization_subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  public?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  service_definition?: Resolver<Maybe<ResolversTypes['ServiceDefinition']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionModel']>>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['ServiceInstanceTag']>>, ParentType, ContextType>;
  user_joined?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceInstanceEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceInstanceEdge'] = ResolversParentTypes['ServiceInstanceEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceInstanceSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceInstanceSubscription'] = ResolversParentTypes['ServiceInstanceSubscription']> = ResolversObject<{
  add?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  delete?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceLinkResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceLink'] = ResolversParentTypes['ServiceLink']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SettingsResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = ResolversObject<{
  base_url_front?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  domains_blacklist?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  environment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_feature_flags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  platform_providers?: Resolver<Array<ResolversTypes['PlatformProvider']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShareableResourceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ShareableResource'] = ResolversParentTypes['ShareableResource']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StreamResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Stream'] = ResolversParentTypes['Stream']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  feed_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_subtype?: Resolver<ResolversTypes['IntegrationSubType'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscribedServiceInstanceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscribedServiceInstance'] = ResolversParentTypes['SubscribedServiceInstance']> = ResolversObject<{
  configurations?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscribedServiceInstanceConfiguration']>>>, ParentType, ContextType>;
  is_personal_space?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscribedServiceInstanceConfigurationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscribedServiceInstanceConfiguration'] = ResolversParentTypes['SubscribedServiceInstanceConfiguration']> = ResolversObject<{
  platform_contract?: Resolver<ResolversTypes['PlatformContract'], ParentType, ContextType>;
  platform_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  registerer_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  MeUser?: SubscriptionResolver<Maybe<ResolversTypes['MeUserSubscription']>, "MeUser", ParentType, ContextType>;
  ServiceInstance?: SubscriptionResolver<Maybe<ResolversTypes['ServiceInstanceSubscription']>, "ServiceInstance", ParentType, ContextType>;
  User?: SubscriptionResolver<Maybe<ResolversTypes['UserSubscription']>, "User", ParentType, ContextType, Partial<SubscriptionUserArgs>>;
  UserPending?: SubscriptionResolver<Maybe<ResolversTypes['UserPendingSubscription']>, "UserPending", ParentType, ContextType, RequireFields<SubscriptionUserPendingArgs, 'organizationId'>>;
}>;

export type SubscriptionCapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscriptionCapability'] = ResolversParentTypes['SubscriptionCapability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_capability?: Resolver<Maybe<ResolversTypes['ServiceCapability']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscriptionEdge'] = ResolversParentTypes['SubscriptionEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['SubscriptionModel'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionModelResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscriptionModel'] = ResolversParentTypes['SubscriptionModel']> = ResolversObject<{
  end_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organization_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription_capability?: Resolver<Maybe<Array<Maybe<ResolversTypes['SubscriptionCapability']>>>, ParentType, ContextType>;
  user_service?: Resolver<Array<Maybe<ResolversTypes['UserService']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SuccessResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Success'] = ResolversParentTypes['Success']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaxiiFeedResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['TaxiiFeed'] = ResolversParentTypes['TaxiiFeed']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  feed_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_subtype?: Resolver<ResolversTypes['IntegrationSubType'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TelemetryResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['TelemetryResponse'] = ResolversParentTypes['TelemetryResponse']> = ResolversObject<{
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ThirdPartyIntegrationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ThirdPartyIntegration'] = ResolversParentTypes['ThirdPartyIntegration']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResource']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  github_url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration_subtype?: Resolver<ResolversTypes['IntegrationSubType'], ParentType, ContextType>;
  integration_type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  use_cases?: Resolver<Maybe<Array<ResolversTypes['UseCase']>>, ParentType, ContextType>;
  vendor_url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TrialsDeploymentsResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['TrialsDeployments'] = ResolversParentTypes['TrialsDeployments']> = ResolversObject<{
  availableTrials?: Resolver<Array<ResolversTypes['PlatformIdentifier']>, ParentType, ContextType>;
  deployed?: Resolver<Array<ResolversTypes['DeployedPlatform']>, ParentType, ContextType>;
  isBlacklisted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UseCaseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UseCase'] = ResolversParentTypes['UseCase']> = ResolversObject<{
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UseCaseConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UseCaseConnection'] = ResolversParentTypes['UseCaseConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UseCaseEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UseCaseEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UseCaseEdge'] = ResolversParentTypes['UseCaseEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['UseCase'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  capabilities?: Resolver<Maybe<Array<ResolversTypes['Capability']>>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  disabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  last_login?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization_capabilities?: Resolver<Maybe<Array<ResolversTypes['OrganizationCapabilities']>>, ParentType, ContextType>;
  organizations?: Resolver<Maybe<Array<ResolversTypes['Organization']>>, ParentType, ContextType>;
  pending_organization_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  roles_portal?: Resolver<Maybe<Array<ResolversTypes['RolePortal']>>, ParentType, ContextType>;
  selected_org_capabilities?: Resolver<Maybe<Array<ResolversTypes['OrganizationCapability']>>, ParentType, ContextType>;
  selected_organization_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserPendingSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserPendingSubscription'] = ResolversParentTypes['UserPendingSubscription']> = ResolversObject<{
  delete?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  invalidate?: Resolver<Maybe<ResolversTypes['OrganizationId']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserServiceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserService'] = ResolversParentTypes['UserService']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ordering?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  subscription_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user_service_capability?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserServiceCapability']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserServiceCapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserServiceCapability'] = ResolversParentTypes['UserServiceCapability']> = ResolversObject<{
  generic_service_capability?: Resolver<Maybe<ResolversTypes['GenericServiceCapability']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  subscription_capability?: Resolver<Maybe<ResolversTypes['SubscriptionCapability']>, ParentType, ContextType>;
  user_service_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserServiceConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserServiceConnection'] = ResolversParentTypes['UserServiceConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UserServiceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserServiceDeletedResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserServiceDeleted'] = ResolversParentTypes['UserServiceDeleted']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  subscription_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserServiceEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserServiceEdge'] = ResolversParentTypes['UserServiceEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['UserService']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserSubscription'] = ResolversParentTypes['UserSubscription']> = ResolversObject<{
  add?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  delete?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  merge?: Resolver<Maybe<ResolversTypes['MergeEvent']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = PortalContext> = ResolversObject<{
  CanUnregisterResponse?: CanUnregisterResponseResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  Connector?: ConnectorResolvers<ContextType>;
  CsvFeed?: CsvFeedResolvers<ContextType>;
  CustomDashboard?: CustomDashboardResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DefaultDocument?: DefaultDocumentResolvers<ContextType>;
  DeployedPlatform?: DeployedPlatformResolvers<ContextType>;
  DeploymentAvailability?: DeploymentAvailabilityResolvers<ContextType>;
  DeploymentRequest?: DeploymentRequestResolvers<ContextType>;
  DeploymentRequestConnection?: DeploymentRequestConnectionResolvers<ContextType>;
  DeploymentRequestEdge?: DeploymentRequestEdgeResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  DocumentConnection?: DocumentConnectionResolvers<ContextType>;
  DocumentEdge?: DocumentEdgeResolvers<ContextType>;
  GenericServiceCapability?: GenericServiceCapabilityResolvers<ContextType>;
  Integration?: IntegrationResolvers<ContextType>;
  IntegrationHack?: IntegrationHackResolvers<ContextType>;
  IsPlatformRegisteredOrganization?: IsPlatformRegisteredOrganizationResolvers<ContextType>;
  IsPlatformRegisteredResponse?: IsPlatformRegisteredResponseResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  MeUserSubscription?: MeUserSubscriptionResolvers<ContextType>;
  MergeEvent?: MergeEventResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  OpenAEVScenario?: OpenAevScenarioResolvers<ContextType>;
  OpenAEVScenarioConnection?: OpenAevScenarioConnectionResolvers<ContextType>;
  OpenAEVScenarioEdge?: OpenAevScenarioEdgeResolvers<ContextType>;
  OpenCTIPlatformRegistrationStatusResponse?: OpenCtiPlatformRegistrationStatusResponseResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationCapabilities?: OrganizationCapabilitiesResolvers<ContextType>;
  OrganizationConnection?: OrganizationConnectionResolvers<ContextType>;
  OrganizationEdge?: OrganizationEdgeResolvers<ContextType>;
  OrganizationId?: OrganizationIdResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PlatformDeploymentRequest?: PlatformDeploymentRequestResolvers<ContextType>;
  PlatformDeploymentRequestConnection?: PlatformDeploymentRequestConnectionResolvers<ContextType>;
  PlatformDeploymentRequestEdge?: PlatformDeploymentRequestEdgeResolvers<ContextType>;
  PlatformProvider?: PlatformProviderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshPlatformRegistrationConnectivityStatusResponse?: RefreshPlatformRegistrationConnectivityStatusResponseResolvers<ContextType>;
  RefreshUserPlatformTokenResponse?: RefreshUserPlatformTokenResponseResolvers<ContextType>;
  RegisteredPlatform?: RegisteredPlatformResolvers<ContextType>;
  RegistrationResponse?: RegistrationResponseResolvers<ContextType>;
  RolePortal?: RolePortalResolvers<ContextType>;
  SendTelemetryMutation?: SendTelemetryMutationResolvers<ContextType>;
  SeoServiceInstance?: SeoServiceInstanceResolvers<ContextType>;
  ServiceCapability?: ServiceCapabilityResolvers<ContextType>;
  ServiceConnection?: ServiceConnectionResolvers<ContextType>;
  ServiceDefinition?: ServiceDefinitionResolvers<ContextType>;
  ServiceGroup?: ServiceGroupResolvers<ContextType>;
  ServiceInstance?: ServiceInstanceResolvers<ContextType>;
  ServiceInstanceEdge?: ServiceInstanceEdgeResolvers<ContextType>;
  ServiceInstanceSubscription?: ServiceInstanceSubscriptionResolvers<ContextType>;
  ServiceLink?: ServiceLinkResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  ShareableResource?: ShareableResourceResolvers<ContextType>;
  Stream?: StreamResolvers<ContextType>;
  SubscribedServiceInstance?: SubscribedServiceInstanceResolvers<ContextType>;
  SubscribedServiceInstanceConfiguration?: SubscribedServiceInstanceConfigurationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionCapability?: SubscriptionCapabilityResolvers<ContextType>;
  SubscriptionEdge?: SubscriptionEdgeResolvers<ContextType>;
  SubscriptionModel?: SubscriptionModelResolvers<ContextType>;
  Success?: SuccessResolvers<ContextType>;
  TaxiiFeed?: TaxiiFeedResolvers<ContextType>;
  TelemetryResponse?: TelemetryResponseResolvers<ContextType>;
  ThirdPartyIntegration?: ThirdPartyIntegrationResolvers<ContextType>;
  TrialsDeployments?: TrialsDeploymentsResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  UseCase?: UseCaseResolvers<ContextType>;
  UseCaseConnection?: UseCaseConnectionResolvers<ContextType>;
  UseCaseEdge?: UseCaseEdgeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserPendingSubscription?: UserPendingSubscriptionResolvers<ContextType>;
  UserService?: UserServiceResolvers<ContextType>;
  UserServiceCapability?: UserServiceCapabilityResolvers<ContextType>;
  UserServiceConnection?: UserServiceConnectionResolvers<ContextType>;
  UserServiceDeleted?: UserServiceDeletedResolvers<ContextType>;
  UserServiceEdge?: UserServiceEdgeResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = PortalContext> = ResolversObject<{
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  platform_token?: Platform_TokenDirectiveResolver<any, any, ContextType>;
  service_capa?: Service_CapaDirectiveResolver<any, any, ContextType>;
  system_token?: System_TokenDirectiveResolver<any, any, ContextType>;
}>;
