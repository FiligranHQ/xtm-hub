import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { PortalContext } from '../model/portal-context.js';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type ActionTracking = Node & {
  __typename?: 'ActionTracking';
  contextual_id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  ended_at?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  message_tracking: Array<MessageTracking>;
  status?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type AddLabelInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type AddServiceInput = {
  fee_type?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  service_instance_description?: InputMaybe<Scalars['String']['input']>;
  service_instance_name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
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

export type CanUnregisterOpenCtiPlatformInput = {
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
  name: Restriction;
};

export type CreateCsvFeedInput = {
  active: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  uploader_id: Scalars['String']['input'];
};

export type CreateCustomDashboardInput = {
  active: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  product_version: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  uploader_id: Scalars['String']['input'];
};

export type CreateOpenAevScenarioInput = {
  active: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  product_version: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  uploader_id: Scalars['String']['input'];
};

export type CsvFeed = Node & {
  __typename?: 'CsvFeed';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResourceImage>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number: Scalars['Int']['output'];
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  labels?: Maybe<Array<Label>>;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  remover_id?: Maybe<Scalars['ID']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number: Scalars['Int']['output'];
  short_description?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
};

export type CsvFeedConnection = {
  __typename?: 'CsvFeedConnection';
  edges: Array<CsvFeedEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CsvFeedEdge = {
  __typename?: 'CsvFeedEdge';
  cursor: Scalars['String']['output'];
  node: CsvFeed;
};

export type CustomDashboard = Node & {
  __typename?: 'CustomDashboard';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResourceImage>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number: Scalars['Int']['output'];
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  labels?: Maybe<Array<Label>>;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number: Scalars['Int']['output'];
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
};

export type CustomDashboardConnection = {
  __typename?: 'CustomDashboardConnection';
  edges: Array<CustomDashboardEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CustomDashboardEdge = {
  __typename?: 'CustomDashboardEdge';
  cursor: Scalars['String']['output'];
  node: CustomDashboard;
};

export type Document = Node & {
  __typename?: 'Document';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<Document>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number: Scalars['Int']['output'];
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number: Scalars['Int']['output'];
  short_description?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
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

export enum DocumentOrdering {
  CreatedAt = 'created_at',
  Description = 'description',
  DownloadNumber = 'download_number',
  FileName = 'file_name'
}

export type EditDocumentInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  uploader_organization_id?: InputMaybe<Scalars['String']['input']>;
};

export type EditLabelInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

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

export type EditUserCapabilitiesInput = {
  capabilities?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Filter = {
  key?: InputMaybe<FilterKey>;
  value: Array<Scalars['String']['input']>;
};

export enum FilterKey {
  Label = 'label',
  OrganizationId = 'organization_id',
  PersonalSpace = 'personal_space'
}

export type GenericServiceCapability = Node & {
  __typename?: 'GenericServiceCapability';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type IsOpenCtiPlatformRegisteredInput = {
  platformId: Scalars['String']['input'];
};

export type IsOpenCtiPlatformRegisteredOrganization = Node & {
  __typename?: 'IsOpenCTIPlatformRegisteredOrganization';
  id: Scalars['ID']['output'];
};

export type IsOpenCtiPlatformRegisteredResponse = {
  __typename?: 'IsOpenCTIPlatformRegisteredResponse';
  organization?: Maybe<IsOpenCtiPlatformRegisteredOrganization>;
  status: PlatformRegistrationStatus;
};

export type Label = Node & {
  __typename?: 'Label';
  color: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LabelConnection = {
  __typename?: 'LabelConnection';
  edges: Array<LabelEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LabelEdge = {
  __typename?: 'LabelEdge';
  cursor: Scalars['String']['output'];
  node: Label;
};

export enum LabelOrdering {
  Color = 'color',
  Name = 'name'
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

export type MessageTracking = Node & {
  __typename?: 'MessageTracking';
  created_at: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  technical?: Maybe<Scalars['Boolean']['output']>;
  tracking_id?: Maybe<Scalars['ID']['output']>;
  tracking_info?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addDocument: Document;
  addLabel: Label;
  addOrganization?: Maybe<Organization>;
  addServiceInstance?: Maybe<SubscriptionModel>;
  addServicePicture?: Maybe<ServiceInstance>;
  addSubscription?: Maybe<ServiceInstance>;
  addSubscriptionInService?: Maybe<ServiceInstance>;
  addUser?: Maybe<User>;
  addUserService?: Maybe<Array<Maybe<UserService>>>;
  addYourselfInUserService?: Maybe<Array<Maybe<UserService>>>;
  adminAddUser?: Maybe<User>;
  adminEditUser: User;
  changeSelectedOrganization?: Maybe<User>;
  createCsvFeed: CsvFeed;
  createCustomDashboard: CustomDashboard;
  createOpenAEVScenario: OpenAevScenario;
  deleteCsvFeed: CsvFeed;
  deleteCustomDashboard: CustomDashboard;
  deleteDocument: Document;
  deleteLabel: Label;
  deleteOpenAEVScenario: OpenAevScenario;
  deleteOrganization?: Maybe<Organization>;
  deleteServiceInstance?: Maybe<ServiceInstance>;
  deleteSubscription?: Maybe<ServiceInstance>;
  deleteUserService?: Maybe<UserService>;
  editDocument: Document;
  editLabel: Label;
  editMeUser: User;
  editOrganization?: Maybe<Organization>;
  editServiceCapability?: Maybe<SubscriptionModel>;
  editServiceInstance?: Maybe<ServiceInstance>;
  editUserCapabilities: User;
  frontendErrorLog?: Maybe<Scalars['Boolean']['output']>;
  incrementShareNumberDocument: Document;
  login?: Maybe<User>;
  logout: Scalars['ID']['output'];
  mergeTest: Scalars['ID']['output'];
  refreshUserPlatformToken: RefreshUserPlatformTokenResponse;
  registerOpenCTIPlatform: RegistrationResponse;
  removePendingUserFromOrganization?: Maybe<User>;
  removeUserFromOrganization?: Maybe<User>;
  resetPassword: Success;
  unregisterOpenCTIPlatform: Success;
  updateCsvFeed: CsvFeed;
  updateCustomDashboard: CustomDashboard;
  updateOpenAEVScenario: OpenAevScenario;
};


export type MutationAddDocumentArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  document?: InputMaybe<Scalars['Upload']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentDocumentId?: InputMaybe<Scalars['ID']['input']>;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};


export type MutationAddLabelArgs = {
  input: AddLabelInput;
};


export type MutationAddOrganizationArgs = {
  input: OrganizationInput;
};


export type MutationAddServiceInstanceArgs = {
  input?: InputMaybe<AddServiceInput>;
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


export type MutationAdminEditUserArgs = {
  id: Scalars['ID']['input'];
  input: AdminEditUserInput;
};


export type MutationChangeSelectedOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
};


export type MutationCreateCsvFeedArgs = {
  document?: InputMaybe<Array<Scalars['Upload']['input']>>;
  input: CreateCsvFeedInput;
  serviceInstanceId: Scalars['String']['input'];
};


export type MutationCreateCustomDashboardArgs = {
  document: Array<Scalars['Upload']['input']>;
  input: CreateCustomDashboardInput;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateOpenAevScenarioArgs = {
  document: Array<Scalars['Upload']['input']>;
  input: CreateOpenAevScenarioInput;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteCsvFeedArgs = {
  id: Scalars['ID']['input'];
  serviceInstanceId: Scalars['String']['input'];
};


export type MutationDeleteCustomDashboardArgs = {
  id: Scalars['ID']['input'];
  serviceInstanceId: Scalars['String']['input'];
};


export type MutationDeleteDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  forceDelete?: InputMaybe<Scalars['Boolean']['input']>;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteLabelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOpenAevScenarioArgs = {
  id: Scalars['ID']['input'];
  serviceInstanceId: Scalars['String']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubscriptionArgs = {
  subscription_id: Scalars['ID']['input'];
};


export type MutationDeleteUserServiceArgs = {
  input: UserServiceDeleteInput;
};


export type MutationEditDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  input: EditDocumentInput;
  service_instance_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditLabelArgs = {
  id: Scalars['ID']['input'];
  input: EditLabelInput;
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


export type MutationEditServiceInstanceArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
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


export type MutationRegisterOpenCtiPlatformArgs = {
  input: RegisterOpenCtiPlatformInput;
};


export type MutationRemovePendingUserFromOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};


export type MutationRemoveUserFromOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};


export type MutationUnregisterOpenCtiPlatformArgs = {
  input?: InputMaybe<UnregisterOpenCtiPlatformInput>;
};


export type MutationUpdateCsvFeedArgs = {
  document?: InputMaybe<Array<Scalars['Upload']['input']>>;
  documentId: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  input: UpdateCsvFeedInput;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
  updateDocument: Scalars['Boolean']['input'];
};


export type MutationUpdateCustomDashboardArgs = {
  document?: InputMaybe<Array<Scalars['Upload']['input']>>;
  documentId: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  input: UpdateCustomDashboardInput;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
  updateDocument: Scalars['Boolean']['input'];
};


export type MutationUpdateOpenAevScenarioArgs = {
  document?: InputMaybe<Array<Scalars['Upload']['input']>>;
  documentId: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  input: UpdateOpenAevScenarioInput;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
  updateDocument: Scalars['Boolean']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type OpenAevScenario = Node & {
  __typename?: 'OpenAEVScenario';
  active: Scalars['Boolean']['output'];
  children_documents?: Maybe<Array<ShareableResourceImage>>;
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number: Scalars['Int']['output'];
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  labels?: Maybe<Array<Label>>;
  minio_name: Scalars['String']['output'];
  name: Scalars['String']['output'];
  product_version?: Maybe<Scalars['String']['output']>;
  service_instance?: Maybe<ServiceInstance>;
  service_instance_id: Scalars['String']['output'];
  share_number: Scalars['Int']['output'];
  short_description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription?: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Date']['output']>;
  updater_id?: Maybe<Scalars['String']['output']>;
  uploader?: Maybe<User>;
  uploader_organization?: Maybe<Organization>;
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

export type OpenCtiPlatform = Node & {
  __typename?: 'OpenCTIPlatform';
  contract: OpenCtiPlatformContract;
  id: Scalars['ID']['output'];
  platform_id: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum OpenCtiPlatformContract {
  Ce = 'CE',
  Ee = 'EE'
}

export type OpenCtiPlatformInput = {
  contract: OpenCtiPlatformContract;
  id: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export enum OpenCtiPlatformRegistrationStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export type OpenCtiPlatformRegistrationStatusInput = {
  platformId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type OpenCtiPlatformRegistrationStatusResponse = {
  __typename?: 'OpenCTIPlatformRegistrationStatusResponse';
  status: OpenCtiPlatformRegistrationStatus;
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
  ManageOpenctiRegistration = 'MANAGE_OPENCTI_REGISTRATION',
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

export type PlatformProvider = {
  __typename?: 'PlatformProvider';
  name: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum PlatformRegistrationStatus {
  NeverRegistered = 'never_registered',
  Registered = 'registered',
  Unregistered = 'unregistered'
}

export type Query = {
  __typename?: 'Query';
  canUnregisterOpenCTIPlatform: CanUnregisterResponse;
  csvFeed?: Maybe<CsvFeed>;
  csvFeeds: CsvFeedConnection;
  customDashboard?: Maybe<CustomDashboard>;
  customDashboards: CustomDashboardConnection;
  document?: Maybe<Document>;
  documentExists?: Maybe<Scalars['Boolean']['output']>;
  documents: DocumentConnection;
  isOpenCTIPlatformRegistered: IsOpenCtiPlatformRegisteredResponse;
  label?: Maybe<Label>;
  labels?: Maybe<LabelConnection>;
  me?: Maybe<User>;
  node?: Maybe<Node>;
  openAEVScenario?: Maybe<OpenAevScenario>;
  openAEVScenarios: OpenAevScenarioConnection;
  openCTIPlatformAssociatedOrganization: Organization;
  openCTIPlatformRegistrationStatus: OpenCtiPlatformRegistrationStatusResponse;
  openCTIPlatforms: Array<OpenCtiPlatform>;
  organization?: Maybe<Organization>;
  organizationAdministrators: Array<User>;
  organizations: OrganizationConnection;
  pendingUsers: UserConnection;
  publicServiceInstances: ServiceConnection;
  rolePortal?: Maybe<RolePortal>;
  rolesPortal: Array<RolePortal>;
  seoCsvFeedBySlug?: Maybe<CsvFeed>;
  seoCsvFeedsByServiceSlug?: Maybe<Array<Maybe<CsvFeed>>>;
  seoCustomDashboardBySlug?: Maybe<CustomDashboard>;
  seoCustomDashboardsByServiceSlug?: Maybe<Array<Maybe<CustomDashboard>>>;
  seoOpenAEVScenarioBySlug?: Maybe<OpenAevScenario>;
  seoOpenAEVScenariosByServiceSlug?: Maybe<Array<Maybe<OpenAevScenario>>>;
  seoServiceInstance: SeoServiceInstance;
  seoServiceInstances: Array<SeoServiceInstance>;
  serviceInstanceById?: Maybe<ServiceInstance>;
  serviceInstanceByIdWithSubscriptions?: Maybe<ServiceInstance>;
  serviceInstances: ServiceConnection;
  serviceUsers?: Maybe<UserServiceConnection>;
  settings: Settings;
  subscribedServiceInstancesByIdentifier: Array<SubscribedServiceInstance>;
  subscriptionById?: Maybe<SubscriptionModel>;
  user?: Maybe<User>;
  userHasOrganizationWithSubscription: Scalars['Boolean']['output'];
  userOrganizations: Array<Organization>;
  userServiceFromSubscription?: Maybe<UserServiceConnection>;
  userServiceOwned?: Maybe<UserServiceConnection>;
  users: UserConnection;
};


export type QueryCanUnregisterOpenCtiPlatformArgs = {
  input: CanUnregisterOpenCtiPlatformInput;
};


export type QueryCsvFeedArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryCsvFeedsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCustomDashboardArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryCustomDashboardsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
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
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  parentsOnly?: InputMaybe<Scalars['Boolean']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIsOpenCtiPlatformRegisteredArgs = {
  input: IsOpenCtiPlatformRegisteredInput;
};


export type QueryLabelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLabelsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: LabelOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOpenAevScenarioArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOpenAevScenariosArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filters?: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOpenCtiPlatformAssociatedOrganizationArgs = {
  platformId: Scalars['String']['input'];
};


export type QueryOpenCtiPlatformRegistrationStatusArgs = {
  input: OpenCtiPlatformRegistrationStatusInput;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationAdministratorsArgs = {
  organizationId: Scalars['ID']['input'];
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


export type QueryPublicServiceInstancesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
};


export type QueryRolePortalArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySeoCsvFeedBySlugArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoCsvFeedsByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoCustomDashboardBySlugArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoCustomDashboardsByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoOpenAevScenarioBySlugArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoOpenAevScenariosByServiceSlugArgs = {
  serviceSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySeoServiceInstanceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryServiceInstanceByIdArgs = {
  service_instance_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceInstanceByIdWithSubscriptionsArgs = {
  service_instance_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceInstancesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
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


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
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

export type RefreshUserPlatformTokenResponse = {
  __typename?: 'RefreshUserPlatformTokenResponse';
  token: Scalars['String']['output'];
};

export type RegisterOpenCtiPlatformInput = {
  organizationId: Scalars['ID']['input'];
  platform: OpenCtiPlatformInput;
};

export type RegistrationResponse = {
  __typename?: 'RegistrationResponse';
  token: Scalars['String']['output'];
};

export enum Restriction {
  AdministrateOrganization = 'ADMINISTRATE_ORGANIZATION',
  BckManageCommunities = 'BCK_MANAGE_COMMUNITIES',
  BckManageServices = 'BCK_MANAGE_SERVICES',
  Bypass = 'BYPASS',
  FrtAccessBilling = 'FRT_ACCESS_BILLING',
  FrtAccessServices = 'FRT_ACCESS_SERVICES',
  FrtManageSettings = 'FRT_MANAGE_SETTINGS',
  FrtManageUser = 'FRT_MANAGE_USER',
  FrtServiceSubscriber = 'FRT_SERVICE_SUBSCRIBER',
  ManageAccess = 'MANAGE_ACCESS',
  ManageOpenctiRegistration = 'MANAGE_OPENCTI_REGISTRATION',
  ManageSubscription = 'MANAGE_SUBSCRIPTION'
}

export type RolePortal = Node & {
  __typename?: 'RolePortal';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
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
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
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
  CsvFeeds = 'csv_feeds',
  CustomDashboards = 'custom_dashboards',
  Link = 'link',
  OpenaevScenarios = 'openaev_scenarios',
  OpenctiRegistration = 'opencti_registration',
  Vault = 'vault'
}

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
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  user_joined?: Maybe<Scalars['Boolean']['output']>;
};

export enum ServiceInstanceCreationStatus {
  Created = 'CREATED',
  Pending = 'PENDING',
  Ready = 'READY'
}

export type ServiceInstanceEdge = {
  __typename?: 'ServiceInstanceEdge';
  cursor: Scalars['String']['output'];
  node: ServiceInstance;
};

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
  environment: Scalars['String']['output'];
  platform_feature_flags: Array<Scalars['String']['output']>;
  platform_providers: Array<PlatformProvider>;
};

export type ShareableResourceImage = {
  __typename?: 'ShareableResourceImage';
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
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
  platform_contract: OpenCtiPlatformContract;
  platform_id: Scalars['String']['output'];
  platform_title: Scalars['String']['output'];
  platform_url: Scalars['String']['output'];
  registerer_id: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  ActionTracking?: Maybe<TrackingSubscription>;
  MeUser?: Maybe<MeUserSubscription>;
  ServiceInstance?: Maybe<ServiceInstanceSubscription>;
  User?: Maybe<UserSubscription>;
  UserPending?: Maybe<UserPendingSubscription>;
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

export type TrackingSubscription = {
  __typename?: 'TrackingSubscription';
  add?: Maybe<ActionTracking>;
  delete?: Maybe<ActionTracking>;
  edit?: Maybe<ActionTracking>;
};

export type UnregisterOpenCtiPlatformInput = {
  platformId: Scalars['String']['input'];
};

export type UpdateCsvFeedInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  uploader_id?: InputMaybe<Scalars['String']['input']>;
  uploader_organization_id?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomDashboardInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  product_version?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  uploader_id?: InputMaybe<Scalars['String']['input']>;
  uploader_organization_id?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOpenAevScenarioInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  product_version?: InputMaybe<Scalars['String']['input']>;
  short_description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  uploader_id?: InputMaybe<Scalars['String']['input']>;
  uploader_organization_id?: InputMaybe<Scalars['String']['input']>;
};

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
  Node: ( ActionTracking ) | ( Capability ) | ( CsvFeed ) | ( CustomDashboard ) | ( Document ) | ( GenericServiceCapability ) | ( IsOpenCtiPlatformRegisteredOrganization ) | ( Label ) | ( MergeEvent ) | ( MessageTracking ) | ( OpenAevScenario ) | ( OpenCtiPlatform ) | ( Organization ) | ( OrganizationCapabilities ) | ( RolePortal ) | ( SeoServiceInstance ) | ( ServiceCapability ) | ( ServiceDefinition ) | ( ServiceInstance ) | ( ServiceLink ) | ( SubscriptionCapability ) | ( SubscriptionModel ) | ( User ) | ( UserService ) | ( UserServiceCapability ) | ( UserServiceDeleted );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ActionTracking: ResolverTypeWrapper<ActionTracking>;
  AddLabelInput: AddLabelInput;
  AddServiceInput: AddServiceInput;
  AddUserInput: AddUserInput;
  AdminAddUserInput: AdminAddUserInput;
  AdminEditUserInput: AdminEditUserInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CanUnregisterOpenCTIPlatformInput: CanUnregisterOpenCtiPlatformInput;
  CanUnregisterResponse: ResolverTypeWrapper<CanUnregisterResponse>;
  Capability: ResolverTypeWrapper<Capability>;
  CreateCsvFeedInput: CreateCsvFeedInput;
  CreateCustomDashboardInput: CreateCustomDashboardInput;
  CreateOpenAEVScenarioInput: CreateOpenAevScenarioInput;
  CsvFeed: ResolverTypeWrapper<CsvFeed>;
  CsvFeedConnection: ResolverTypeWrapper<CsvFeedConnection>;
  CsvFeedEdge: ResolverTypeWrapper<CsvFeedEdge>;
  CustomDashboard: ResolverTypeWrapper<CustomDashboard>;
  CustomDashboardConnection: ResolverTypeWrapper<CustomDashboardConnection>;
  CustomDashboardEdge: ResolverTypeWrapper<CustomDashboardEdge>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  Document: ResolverTypeWrapper<Document>;
  DocumentConnection: ResolverTypeWrapper<DocumentConnection>;
  DocumentEdge: ResolverTypeWrapper<DocumentEdge>;
  DocumentOrdering: DocumentOrdering;
  EditDocumentInput: EditDocumentInput;
  EditLabelInput: EditLabelInput;
  EditMeUserInput: EditMeUserInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUserCapabilitiesInput: EditUserCapabilitiesInput;
  Filter: Filter;
  FilterKey: FilterKey;
  GenericServiceCapability: ResolverTypeWrapper<GenericServiceCapability>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  IsOpenCTIPlatformRegisteredInput: IsOpenCtiPlatformRegisteredInput;
  IsOpenCTIPlatformRegisteredOrganization: ResolverTypeWrapper<IsOpenCtiPlatformRegisteredOrganization>;
  IsOpenCTIPlatformRegisteredResponse: ResolverTypeWrapper<IsOpenCtiPlatformRegisteredResponse>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Label: ResolverTypeWrapper<Label>;
  LabelConnection: ResolverTypeWrapper<LabelConnection>;
  LabelEdge: ResolverTypeWrapper<LabelEdge>;
  LabelOrdering: LabelOrdering;
  MeUserSubscription: ResolverTypeWrapper<MeUserSubscription>;
  MergeEvent: ResolverTypeWrapper<MergeEvent>;
  MessageTracking: ResolverTypeWrapper<MessageTracking>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  OpenAEVScenario: ResolverTypeWrapper<OpenAevScenario>;
  OpenAEVScenarioConnection: ResolverTypeWrapper<OpenAevScenarioConnection>;
  OpenAEVScenarioEdge: ResolverTypeWrapper<OpenAevScenarioEdge>;
  OpenCTIPlatform: ResolverTypeWrapper<OpenCtiPlatform>;
  OpenCTIPlatformContract: OpenCtiPlatformContract;
  OpenCTIPlatformInput: OpenCtiPlatformInput;
  OpenCTIPlatformRegistrationStatus: OpenCtiPlatformRegistrationStatus;
  OpenCTIPlatformRegistrationStatusInput: OpenCtiPlatformRegistrationStatusInput;
  OpenCTIPlatformRegistrationStatusResponse: ResolverTypeWrapper<OpenCtiPlatformRegistrationStatusResponse>;
  OrderingMode: OrderingMode;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationCapabilities: ResolverTypeWrapper<OrganizationCapabilities>;
  OrganizationCapabilitiesInput: OrganizationCapabilitiesInput;
  OrganizationCapability: OrganizationCapability;
  OrganizationConnection: ResolverTypeWrapper<OrganizationConnection>;
  OrganizationEdge: ResolverTypeWrapper<OrganizationEdge>;
  OrganizationInput: OrganizationInput;
  OrganizationOrdering: OrganizationOrdering;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PlatformProvider: ResolverTypeWrapper<PlatformProvider>;
  PlatformRegistrationStatus: PlatformRegistrationStatus;
  Query: ResolverTypeWrapper<{}>;
  RefreshUserPlatformTokenResponse: ResolverTypeWrapper<RefreshUserPlatformTokenResponse>;
  RegisterOpenCTIPlatformInput: RegisterOpenCtiPlatformInput;
  RegistrationResponse: ResolverTypeWrapper<RegistrationResponse>;
  Restriction: Restriction;
  RolePortal: ResolverTypeWrapper<RolePortal>;
  SeoServiceInstance: ResolverTypeWrapper<SeoServiceInstance>;
  ServiceCapability: ResolverTypeWrapper<ServiceCapability>;
  ServiceConfigurationStatus: ServiceConfigurationStatus;
  ServiceConnection: ResolverTypeWrapper<ServiceConnection>;
  ServiceDefinition: ResolverTypeWrapper<ServiceDefinition>;
  ServiceDefinitionIdentifier: ServiceDefinitionIdentifier;
  ServiceInstance: ResolverTypeWrapper<ServiceInstance>;
  ServiceInstanceCreationStatus: ServiceInstanceCreationStatus;
  ServiceInstanceEdge: ResolverTypeWrapper<ServiceInstanceEdge>;
  ServiceInstanceJoinType: ServiceInstanceJoinType;
  ServiceInstanceOrdering: ServiceInstanceOrdering;
  ServiceInstanceSubscription: ResolverTypeWrapper<ServiceInstanceSubscription>;
  ServiceLink: ResolverTypeWrapper<ServiceLink>;
  ServiceRestriction: ServiceRestriction;
  Settings: ResolverTypeWrapper<Settings>;
  ShareableResourceImage: ResolverTypeWrapper<ShareableResourceImage>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubscribedServiceInstance: ResolverTypeWrapper<SubscribedServiceInstance>;
  SubscribedServiceInstanceConfiguration: ResolverTypeWrapper<SubscribedServiceInstanceConfiguration>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionCapability: ResolverTypeWrapper<SubscriptionCapability>;
  SubscriptionEdge: ResolverTypeWrapper<SubscriptionEdge>;
  SubscriptionModel: ResolverTypeWrapper<SubscriptionModel>;
  SubscriptionOrdering: SubscriptionOrdering;
  Success: ResolverTypeWrapper<Success>;
  TrackingSubscription: ResolverTypeWrapper<TrackingSubscription>;
  UnregisterOpenCTIPlatformInput: UnregisterOpenCtiPlatformInput;
  UpdateCsvFeedInput: UpdateCsvFeedInput;
  UpdateCustomDashboardInput: UpdateCustomDashboardInput;
  UpdateOpenAEVScenarioInput: UpdateOpenAevScenarioInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
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
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActionTracking: ActionTracking;
  AddLabelInput: AddLabelInput;
  AddServiceInput: AddServiceInput;
  AddUserInput: AddUserInput;
  AdminAddUserInput: AdminAddUserInput;
  AdminEditUserInput: AdminEditUserInput;
  Boolean: Scalars['Boolean']['output'];
  CanUnregisterOpenCTIPlatformInput: CanUnregisterOpenCtiPlatformInput;
  CanUnregisterResponse: CanUnregisterResponse;
  Capability: Capability;
  CreateCsvFeedInput: CreateCsvFeedInput;
  CreateCustomDashboardInput: CreateCustomDashboardInput;
  CreateOpenAEVScenarioInput: CreateOpenAevScenarioInput;
  CsvFeed: CsvFeed;
  CsvFeedConnection: CsvFeedConnection;
  CsvFeedEdge: CsvFeedEdge;
  CustomDashboard: CustomDashboard;
  CustomDashboardConnection: CustomDashboardConnection;
  CustomDashboardEdge: CustomDashboardEdge;
  Date: Scalars['Date']['output'];
  Document: Document;
  DocumentConnection: DocumentConnection;
  DocumentEdge: DocumentEdge;
  EditDocumentInput: EditDocumentInput;
  EditLabelInput: EditLabelInput;
  EditMeUserInput: EditMeUserInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUserCapabilitiesInput: EditUserCapabilitiesInput;
  Filter: Filter;
  GenericServiceCapability: GenericServiceCapability;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  IsOpenCTIPlatformRegisteredInput: IsOpenCtiPlatformRegisteredInput;
  IsOpenCTIPlatformRegisteredOrganization: IsOpenCtiPlatformRegisteredOrganization;
  IsOpenCTIPlatformRegisteredResponse: IsOpenCtiPlatformRegisteredResponse;
  JSON: Scalars['JSON']['output'];
  Label: Label;
  LabelConnection: LabelConnection;
  LabelEdge: LabelEdge;
  MeUserSubscription: MeUserSubscription;
  MergeEvent: MergeEvent;
  MessageTracking: MessageTracking;
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  OpenAEVScenario: OpenAevScenario;
  OpenAEVScenarioConnection: OpenAevScenarioConnection;
  OpenAEVScenarioEdge: OpenAevScenarioEdge;
  OpenCTIPlatform: OpenCtiPlatform;
  OpenCTIPlatformInput: OpenCtiPlatformInput;
  OpenCTIPlatformRegistrationStatusInput: OpenCtiPlatformRegistrationStatusInput;
  OpenCTIPlatformRegistrationStatusResponse: OpenCtiPlatformRegistrationStatusResponse;
  Organization: Organization;
  OrganizationCapabilities: OrganizationCapabilities;
  OrganizationCapabilitiesInput: OrganizationCapabilitiesInput;
  OrganizationConnection: OrganizationConnection;
  OrganizationEdge: OrganizationEdge;
  OrganizationInput: OrganizationInput;
  PageInfo: PageInfo;
  PlatformProvider: PlatformProvider;
  Query: {};
  RefreshUserPlatformTokenResponse: RefreshUserPlatformTokenResponse;
  RegisterOpenCTIPlatformInput: RegisterOpenCtiPlatformInput;
  RegistrationResponse: RegistrationResponse;
  RolePortal: RolePortal;
  SeoServiceInstance: SeoServiceInstance;
  ServiceCapability: ServiceCapability;
  ServiceConnection: ServiceConnection;
  ServiceDefinition: ServiceDefinition;
  ServiceInstance: ServiceInstance;
  ServiceInstanceEdge: ServiceInstanceEdge;
  ServiceInstanceSubscription: ServiceInstanceSubscription;
  ServiceLink: ServiceLink;
  Settings: Settings;
  ShareableResourceImage: ShareableResourceImage;
  String: Scalars['String']['output'];
  SubscribedServiceInstance: SubscribedServiceInstance;
  SubscribedServiceInstanceConfiguration: SubscribedServiceInstanceConfiguration;
  Subscription: {};
  SubscriptionCapability: SubscriptionCapability;
  SubscriptionEdge: SubscriptionEdge;
  SubscriptionModel: SubscriptionModel;
  Success: Success;
  TrackingSubscription: TrackingSubscription;
  UnregisterOpenCTIPlatformInput: UnregisterOpenCtiPlatformInput;
  UpdateCsvFeedInput: UpdateCsvFeedInput;
  UpdateCustomDashboardInput: UpdateCustomDashboardInput;
  UpdateOpenAEVScenarioInput: UpdateOpenAevScenarioInput;
  Upload: Scalars['Upload']['output'];
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
}>;

export type AuthDirectiveArgs = {
  requires?: Maybe<Array<Maybe<Restriction>>>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Service_CapaDirectiveArgs = {
  requires?: Maybe<Array<Maybe<ServiceRestriction>>>;
};

export type Service_CapaDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = Service_CapaDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ActionTrackingResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ActionTracking'] = ResolversParentTypes['ActionTracking']> = ResolversObject<{
  contextual_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  ended_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message_tracking?: Resolver<Array<ResolversTypes['MessageTracking']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CanUnregisterResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CanUnregisterResponse'] = ResolversParentTypes['CanUnregisterResponse']> = ResolversObject<{
  isAllowed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isInOrganization?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPlatformRegistered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organizationId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['Restriction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CsvFeedResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CsvFeed'] = ResolversParentTypes['CsvFeed']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResourceImage']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  remover_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CsvFeedConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CsvFeedConnection'] = ResolversParentTypes['CsvFeedConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CsvFeedEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CsvFeedEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CsvFeedEdge'] = ResolversParentTypes['CsvFeedEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['CsvFeed'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomDashboardResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CustomDashboard'] = ResolversParentTypes['CustomDashboard']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResourceImage']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomDashboardConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CustomDashboardConnection'] = ResolversParentTypes['CustomDashboardConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CustomDashboardEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomDashboardEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['CustomDashboardEdge'] = ResolversParentTypes['CustomDashboardEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['CustomDashboard'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DocumentResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['Document']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type IsOpenCtiPlatformRegisteredOrganizationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['IsOpenCTIPlatformRegisteredOrganization'] = ResolversParentTypes['IsOpenCTIPlatformRegisteredOrganization']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IsOpenCtiPlatformRegisteredResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['IsOpenCTIPlatformRegisteredResponse'] = ResolversParentTypes['IsOpenCTIPlatformRegisteredResponse']> = ResolversObject<{
  organization?: Resolver<Maybe<ResolversTypes['IsOpenCTIPlatformRegisteredOrganization']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PlatformRegistrationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LabelResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = ResolversObject<{
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LabelConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['LabelConnection'] = ResolversParentTypes['LabelConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['LabelEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LabelEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['LabelEdge'] = ResolversParentTypes['LabelEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Label'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

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

export type MessageTrackingResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['MessageTracking'] = ResolversParentTypes['MessageTracking']> = ResolversObject<{
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  technical?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  tracking_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  tracking_info?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationAddDocumentArgs, 'type'>>;
  addLabel?: Resolver<ResolversTypes['Label'], ParentType, ContextType, RequireFields<MutationAddLabelArgs, 'input'>>;
  addOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationAddOrganizationArgs, 'input'>>;
  addServiceInstance?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType, Partial<MutationAddServiceInstanceArgs>>;
  addServicePicture?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationAddServicePictureArgs, 'serviceInstanceId'>>;
  addSubscription?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<MutationAddSubscriptionArgs>>;
  addSubscriptionInService?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<MutationAddSubscriptionInServiceArgs>>;
  addUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddUserArgs, 'input'>>;
  addUserService?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserService']>>>, ParentType, ContextType, RequireFields<MutationAddUserServiceArgs, 'input'>>;
  addYourselfInUserService?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserService']>>>, ParentType, ContextType, RequireFields<MutationAddYourselfInUserServiceArgs, 'input'>>;
  adminAddUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAdminAddUserArgs, 'input'>>;
  adminEditUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAdminEditUserArgs, 'id' | 'input'>>;
  changeSelectedOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationChangeSelectedOrganizationArgs, 'organization_id'>>;
  createCsvFeed?: Resolver<ResolversTypes['CsvFeed'], ParentType, ContextType, RequireFields<MutationCreateCsvFeedArgs, 'input' | 'serviceInstanceId'>>;
  createCustomDashboard?: Resolver<ResolversTypes['CustomDashboard'], ParentType, ContextType, RequireFields<MutationCreateCustomDashboardArgs, 'document' | 'input'>>;
  createOpenAEVScenario?: Resolver<ResolversTypes['OpenAEVScenario'], ParentType, ContextType, RequireFields<MutationCreateOpenAevScenarioArgs, 'document' | 'input'>>;
  deleteCsvFeed?: Resolver<ResolversTypes['CsvFeed'], ParentType, ContextType, RequireFields<MutationDeleteCsvFeedArgs, 'id' | 'serviceInstanceId'>>;
  deleteCustomDashboard?: Resolver<ResolversTypes['CustomDashboard'], ParentType, ContextType, RequireFields<MutationDeleteCustomDashboardArgs, 'id' | 'serviceInstanceId'>>;
  deleteDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationDeleteDocumentArgs>>;
  deleteLabel?: Resolver<ResolversTypes['Label'], ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'id'>>;
  deleteOpenAEVScenario?: Resolver<ResolversTypes['OpenAEVScenario'], ParentType, ContextType, RequireFields<MutationDeleteOpenAevScenarioArgs, 'id' | 'serviceInstanceId'>>;
  deleteOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationDeleteOrganizationArgs, 'id'>>;
  deleteServiceInstance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationDeleteServiceInstanceArgs, 'id'>>;
  deleteSubscription?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationDeleteSubscriptionArgs, 'subscription_id'>>;
  deleteUserService?: Resolver<Maybe<ResolversTypes['UserService']>, ParentType, ContextType, RequireFields<MutationDeleteUserServiceArgs, 'input'>>;
  editDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, RequireFields<MutationEditDocumentArgs, 'input'>>;
  editLabel?: Resolver<ResolversTypes['Label'], ParentType, ContextType, RequireFields<MutationEditLabelArgs, 'id' | 'input'>>;
  editMeUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditMeUserArgs, 'input'>>;
  editOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationEditOrganizationArgs, 'id' | 'input'>>;
  editServiceCapability?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType, Partial<MutationEditServiceCapabilityArgs>>;
  editServiceInstance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, RequireFields<MutationEditServiceInstanceArgs, 'id' | 'name'>>;
  editUserCapabilities?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditUserCapabilitiesArgs, 'id' | 'input'>>;
  frontendErrorLog?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationFrontendErrorLogArgs, 'message'>>;
  incrementShareNumberDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationIncrementShareNumberDocumentArgs>>;
  login?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email'>>;
  logout?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mergeTest?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationMergeTestArgs, 'from' | 'target'>>;
  refreshUserPlatformToken?: Resolver<ResolversTypes['RefreshUserPlatformTokenResponse'], ParentType, ContextType>;
  registerOpenCTIPlatform?: Resolver<ResolversTypes['RegistrationResponse'], ParentType, ContextType, RequireFields<MutationRegisterOpenCtiPlatformArgs, 'input'>>;
  removePendingUserFromOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemovePendingUserFromOrganizationArgs, 'organization_id' | 'user_id'>>;
  removeUserFromOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromOrganizationArgs, 'organization_id' | 'user_id'>>;
  resetPassword?: Resolver<ResolversTypes['Success'], ParentType, ContextType>;
  unregisterOpenCTIPlatform?: Resolver<ResolversTypes['Success'], ParentType, ContextType, Partial<MutationUnregisterOpenCtiPlatformArgs>>;
  updateCsvFeed?: Resolver<ResolversTypes['CsvFeed'], ParentType, ContextType, RequireFields<MutationUpdateCsvFeedArgs, 'documentId' | 'input' | 'updateDocument'>>;
  updateCustomDashboard?: Resolver<ResolversTypes['CustomDashboard'], ParentType, ContextType, RequireFields<MutationUpdateCustomDashboardArgs, 'documentId' | 'input' | 'updateDocument'>>;
  updateOpenAEVScenario?: Resolver<ResolversTypes['OpenAEVScenario'], ParentType, ContextType, RequireFields<MutationUpdateOpenAevScenarioArgs, 'documentId' | 'input' | 'updateDocument'>>;
}>;

export type NodeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActionTracking' | 'Capability' | 'CsvFeed' | 'CustomDashboard' | 'Document' | 'GenericServiceCapability' | 'IsOpenCTIPlatformRegisteredOrganization' | 'Label' | 'MergeEvent' | 'MessageTracking' | 'OpenAEVScenario' | 'OpenCTIPlatform' | 'Organization' | 'OrganizationCapabilities' | 'RolePortal' | 'SeoServiceInstance' | 'ServiceCapability' | 'ServiceDefinition' | 'ServiceInstance' | 'ServiceLink' | 'SubscriptionCapability' | 'SubscriptionModel' | 'User' | 'UserService' | 'UserServiceCapability' | 'UserServiceDeleted', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type OpenAevScenarioResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenAEVScenario'] = ResolversParentTypes['OpenAEVScenario']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  children_documents?: Resolver<Maybe<Array<ResolversTypes['ShareableResourceImage']>>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_instance?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType>;
  service_instance_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  share_number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  short_description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  updater_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploader?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  uploader_organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
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

export type OpenCtiPlatformResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenCTIPlatform'] = ResolversParentTypes['OpenCTIPlatform']> = ResolversObject<{
  contract?: Resolver<ResolversTypes['OpenCTIPlatformContract'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  platform_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OpenCtiPlatformRegistrationStatusResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OpenCTIPlatformRegistrationStatusResponse'] = ResolversParentTypes['OpenCTIPlatformRegistrationStatusResponse']> = ResolversObject<{
  status?: Resolver<ResolversTypes['OpenCTIPlatformRegistrationStatus'], ParentType, ContextType>;
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

export type PageInfoResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformProviderResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['PlatformProvider'] = ResolversParentTypes['PlatformProvider']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  canUnregisterOpenCTIPlatform?: Resolver<ResolversTypes['CanUnregisterResponse'], ParentType, ContextType, RequireFields<QueryCanUnregisterOpenCtiPlatformArgs, 'input'>>;
  csvFeed?: Resolver<Maybe<ResolversTypes['CsvFeed']>, ParentType, ContextType, Partial<QueryCsvFeedArgs>>;
  csvFeeds?: Resolver<ResolversTypes['CsvFeedConnection'], ParentType, ContextType, RequireFields<QueryCsvFeedsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  customDashboard?: Resolver<Maybe<ResolversTypes['CustomDashboard']>, ParentType, ContextType, Partial<QueryCustomDashboardArgs>>;
  customDashboards?: Resolver<ResolversTypes['CustomDashboardConnection'], ParentType, ContextType, RequireFields<QueryCustomDashboardsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  document?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType, Partial<QueryDocumentArgs>>;
  documentExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, Partial<QueryDocumentExistsArgs>>;
  documents?: Resolver<ResolversTypes['DocumentConnection'], ParentType, ContextType, RequireFields<QueryDocumentsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  isOpenCTIPlatformRegistered?: Resolver<ResolversTypes['IsOpenCTIPlatformRegisteredResponse'], ParentType, ContextType, RequireFields<QueryIsOpenCtiPlatformRegisteredArgs, 'input'>>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<QueryLabelArgs, 'id'>>;
  labels?: Resolver<Maybe<ResolversTypes['LabelConnection']>, ParentType, ContextType, RequireFields<QueryLabelsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  openAEVScenario?: Resolver<Maybe<ResolversTypes['OpenAEVScenario']>, ParentType, ContextType, Partial<QueryOpenAevScenarioArgs>>;
  openAEVScenarios?: Resolver<ResolversTypes['OpenAEVScenarioConnection'], ParentType, ContextType, RequireFields<QueryOpenAevScenariosArgs, 'first' | 'orderBy' | 'orderMode'>>;
  openCTIPlatformAssociatedOrganization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType, RequireFields<QueryOpenCtiPlatformAssociatedOrganizationArgs, 'platformId'>>;
  openCTIPlatformRegistrationStatus?: Resolver<ResolversTypes['OpenCTIPlatformRegistrationStatusResponse'], ParentType, ContextType, RequireFields<QueryOpenCtiPlatformRegistrationStatusArgs, 'input'>>;
  openCTIPlatforms?: Resolver<Array<ResolversTypes['OpenCTIPlatform']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryOrganizationArgs, 'id'>>;
  organizationAdministrators?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryOrganizationAdministratorsArgs, 'organizationId'>>;
  organizations?: Resolver<ResolversTypes['OrganizationConnection'], ParentType, ContextType, RequireFields<QueryOrganizationsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  pendingUsers?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryPendingUsersArgs, 'first' | 'orderBy' | 'orderMode'>>;
  publicServiceInstances?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryPublicServiceInstancesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  rolePortal?: Resolver<Maybe<ResolversTypes['RolePortal']>, ParentType, ContextType, RequireFields<QueryRolePortalArgs, 'id'>>;
  rolesPortal?: Resolver<Array<ResolversTypes['RolePortal']>, ParentType, ContextType>;
  seoCsvFeedBySlug?: Resolver<Maybe<ResolversTypes['CsvFeed']>, ParentType, ContextType, Partial<QuerySeoCsvFeedBySlugArgs>>;
  seoCsvFeedsByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['CsvFeed']>>>, ParentType, ContextType, Partial<QuerySeoCsvFeedsByServiceSlugArgs>>;
  seoCustomDashboardBySlug?: Resolver<Maybe<ResolversTypes['CustomDashboard']>, ParentType, ContextType, Partial<QuerySeoCustomDashboardBySlugArgs>>;
  seoCustomDashboardsByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['CustomDashboard']>>>, ParentType, ContextType, Partial<QuerySeoCustomDashboardsByServiceSlugArgs>>;
  seoOpenAEVScenarioBySlug?: Resolver<Maybe<ResolversTypes['OpenAEVScenario']>, ParentType, ContextType, Partial<QuerySeoOpenAevScenarioBySlugArgs>>;
  seoOpenAEVScenariosByServiceSlug?: Resolver<Maybe<Array<Maybe<ResolversTypes['OpenAEVScenario']>>>, ParentType, ContextType, Partial<QuerySeoOpenAevScenariosByServiceSlugArgs>>;
  seoServiceInstance?: Resolver<ResolversTypes['SeoServiceInstance'], ParentType, ContextType, RequireFields<QuerySeoServiceInstanceArgs, 'slug'>>;
  seoServiceInstances?: Resolver<Array<ResolversTypes['SeoServiceInstance']>, ParentType, ContextType>;
  serviceInstanceById?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<QueryServiceInstanceByIdArgs>>;
  serviceInstanceByIdWithSubscriptions?: Resolver<Maybe<ResolversTypes['ServiceInstance']>, ParentType, ContextType, Partial<QueryServiceInstanceByIdWithSubscriptionsArgs>>;
  serviceInstances?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryServiceInstancesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  serviceUsers?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryServiceUsersArgs, 'first' | 'id' | 'orderBy' | 'orderMode'>>;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
  subscribedServiceInstancesByIdentifier?: Resolver<Array<ResolversTypes['SubscribedServiceInstance']>, ParentType, ContextType, RequireFields<QuerySubscribedServiceInstancesByIdentifierArgs, 'identifier'>>;
  subscriptionById?: Resolver<Maybe<ResolversTypes['SubscriptionModel']>, ParentType, ContextType, Partial<QuerySubscriptionByIdArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userHasOrganizationWithSubscription?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userOrganizations?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  userServiceFromSubscription?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryUserServiceFromSubscriptionArgs, 'first' | 'orderBy' | 'orderMode' | 'subscription_id'>>;
  userServiceOwned?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryUserServiceOwnedArgs, 'first' | 'orderBy' | 'orderMode'>>;
  users?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'first' | 'orderBy' | 'orderMode'>>;
}>;

export type RefreshUserPlatformTokenResponseResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RefreshUserPlatformTokenResponse'] = ResolversParentTypes['RefreshUserPlatformTokenResponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type SeoServiceInstanceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SeoServiceInstance'] = ResolversParentTypes['SeoServiceInstance']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  illustration_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceLink']>>>, ParentType, ContextType>;
  logo_document_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  service_definition?: Resolver<ResolversTypes['ServiceDefinition'], ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
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
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  user_joined?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceInstanceEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceInstanceEdge'] = ResolversParentTypes['ServiceInstanceEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['ServiceInstance'], ParentType, ContextType>;
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
  environment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_feature_flags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  platform_providers?: Resolver<Array<ResolversTypes['PlatformProvider']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShareableResourceImageResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ShareableResourceImage'] = ResolversParentTypes['ShareableResourceImage']> = ResolversObject<{
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  platform_contract?: Resolver<ResolversTypes['OpenCTIPlatformContract'], ParentType, ContextType>;
  platform_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  platform_url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  registerer_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  ActionTracking?: SubscriptionResolver<Maybe<ResolversTypes['TrackingSubscription']>, "ActionTracking", ParentType, ContextType>;
  MeUser?: SubscriptionResolver<Maybe<ResolversTypes['MeUserSubscription']>, "MeUser", ParentType, ContextType>;
  ServiceInstance?: SubscriptionResolver<Maybe<ResolversTypes['ServiceInstanceSubscription']>, "ServiceInstance", ParentType, ContextType>;
  User?: SubscriptionResolver<Maybe<ResolversTypes['UserSubscription']>, "User", ParentType, ContextType>;
  UserPending?: SubscriptionResolver<Maybe<ResolversTypes['UserPendingSubscription']>, "UserPending", ParentType, ContextType>;
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

export type TrackingSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['TrackingSubscription'] = ResolversParentTypes['TrackingSubscription']> = ResolversObject<{
  add?: Resolver<Maybe<ResolversTypes['ActionTracking']>, ParentType, ContextType>;
  delete?: Resolver<Maybe<ResolversTypes['ActionTracking']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['ActionTracking']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

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
  ActionTracking?: ActionTrackingResolvers<ContextType>;
  CanUnregisterResponse?: CanUnregisterResponseResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  CsvFeed?: CsvFeedResolvers<ContextType>;
  CsvFeedConnection?: CsvFeedConnectionResolvers<ContextType>;
  CsvFeedEdge?: CsvFeedEdgeResolvers<ContextType>;
  CustomDashboard?: CustomDashboardResolvers<ContextType>;
  CustomDashboardConnection?: CustomDashboardConnectionResolvers<ContextType>;
  CustomDashboardEdge?: CustomDashboardEdgeResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Document?: DocumentResolvers<ContextType>;
  DocumentConnection?: DocumentConnectionResolvers<ContextType>;
  DocumentEdge?: DocumentEdgeResolvers<ContextType>;
  GenericServiceCapability?: GenericServiceCapabilityResolvers<ContextType>;
  IsOpenCTIPlatformRegisteredOrganization?: IsOpenCtiPlatformRegisteredOrganizationResolvers<ContextType>;
  IsOpenCTIPlatformRegisteredResponse?: IsOpenCtiPlatformRegisteredResponseResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Label?: LabelResolvers<ContextType>;
  LabelConnection?: LabelConnectionResolvers<ContextType>;
  LabelEdge?: LabelEdgeResolvers<ContextType>;
  MeUserSubscription?: MeUserSubscriptionResolvers<ContextType>;
  MergeEvent?: MergeEventResolvers<ContextType>;
  MessageTracking?: MessageTrackingResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  OpenAEVScenario?: OpenAevScenarioResolvers<ContextType>;
  OpenAEVScenarioConnection?: OpenAevScenarioConnectionResolvers<ContextType>;
  OpenAEVScenarioEdge?: OpenAevScenarioEdgeResolvers<ContextType>;
  OpenCTIPlatform?: OpenCtiPlatformResolvers<ContextType>;
  OpenCTIPlatformRegistrationStatusResponse?: OpenCtiPlatformRegistrationStatusResponseResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationCapabilities?: OrganizationCapabilitiesResolvers<ContextType>;
  OrganizationConnection?: OrganizationConnectionResolvers<ContextType>;
  OrganizationEdge?: OrganizationEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PlatformProvider?: PlatformProviderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshUserPlatformTokenResponse?: RefreshUserPlatformTokenResponseResolvers<ContextType>;
  RegistrationResponse?: RegistrationResponseResolvers<ContextType>;
  RolePortal?: RolePortalResolvers<ContextType>;
  SeoServiceInstance?: SeoServiceInstanceResolvers<ContextType>;
  ServiceCapability?: ServiceCapabilityResolvers<ContextType>;
  ServiceConnection?: ServiceConnectionResolvers<ContextType>;
  ServiceDefinition?: ServiceDefinitionResolvers<ContextType>;
  ServiceInstance?: ServiceInstanceResolvers<ContextType>;
  ServiceInstanceEdge?: ServiceInstanceEdgeResolvers<ContextType>;
  ServiceInstanceSubscription?: ServiceInstanceSubscriptionResolvers<ContextType>;
  ServiceLink?: ServiceLinkResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  ShareableResourceImage?: ShareableResourceImageResolvers<ContextType>;
  SubscribedServiceInstance?: SubscribedServiceInstanceResolvers<ContextType>;
  SubscribedServiceInstanceConfiguration?: SubscribedServiceInstanceConfigurationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionCapability?: SubscriptionCapabilityResolvers<ContextType>;
  SubscriptionEdge?: SubscriptionEdgeResolvers<ContextType>;
  SubscriptionModel?: SubscriptionModelResolvers<ContextType>;
  Success?: SuccessResolvers<ContextType>;
  TrackingSubscription?: TrackingSubscriptionResolvers<ContextType>;
  Upload?: GraphQLScalarType;
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
  service_capa?: Service_CapaDirectiveResolver<any, any, ContextType>;
}>;
