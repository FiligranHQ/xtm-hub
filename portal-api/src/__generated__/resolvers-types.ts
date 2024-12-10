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

export type AddServiceInput = {
  fee_type?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  service_description?: InputMaybe<Scalars['String']['input']>;
  service_name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type AddServicePriceInput = {
  fee_type?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  service_id?: InputMaybe<Scalars['ID']['input']>;
};

export type AddUserInput = {
  email: Scalars['String']['input'];
  organizations: Array<InputMaybe<Scalars['String']['input']>>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles_id: Array<InputMaybe<Scalars['String']['input']>>;
};

export type Capability = Node & {
  __typename?: 'Capability';
  id: Scalars['ID']['output'];
  name: Restriction;
};

export type Document = Node & {
  __typename?: 'Document';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  download_number?: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minio_name: Scalars['String']['output'];
  service_id: Scalars['String']['output'];
  uploader_id: Scalars['String']['output'];
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

export type EditOrganizationInput = {
  name: Scalars['String']['input'];
};

export type EditServiceCapabilityInput = {
  capabilities: Array<InputMaybe<Scalars['String']['input']>>;
  user_service_id?: InputMaybe<Scalars['String']['input']>;
};

export type EditUserInput = {
  email: Scalars['String']['input'];
  organizations: Array<InputMaybe<Scalars['String']['input']>>;
  roles_id: Array<InputMaybe<Scalars['String']['input']>>;
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
  addOrganization?: Maybe<Organization>;
  addService?: Maybe<Subscription>;
  addServicePrice?: Maybe<ServicePrice>;
  addSubscription?: Maybe<Service>;
  addSubscriptionInService?: Maybe<Service>;
  addUser?: Maybe<User>;
  addUserService?: Maybe<Subscription>;
  changeSelectedOrganization?: Maybe<User>;
  deleteDocument: Document;
  deleteOrganization?: Maybe<Organization>;
  deleteService?: Maybe<Service>;
  deleteSubscription?: Maybe<Service>;
  deleteUser?: Maybe<User>;
  deleteUserService?: Maybe<Subscription>;
  editDocument: Document;
  editOrganization?: Maybe<Organization>;
  editService?: Maybe<Service>;
  editServiceCapability?: Maybe<Subscription>;
  editUser: User;
  frontendErrorLog?: Maybe<Scalars['Boolean']['output']>;
  login?: Maybe<User>;
  logout: Scalars['ID']['output'];
  mergeTest: Scalars['ID']['output'];
  removeUserFromOrganization?: Maybe<User>;
};


export type MutationAddDocumentArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  document?: InputMaybe<Scalars['Upload']['input']>;
  serviceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddOrganizationArgs = {
  name: Scalars['String']['input'];
};


export type MutationAddServiceArgs = {
  input?: InputMaybe<AddServiceInput>;
};


export type MutationAddServicePriceArgs = {
  input?: InputMaybe<AddServicePriceInput>;
};


export type MutationAddSubscriptionArgs = {
  service_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddSubscriptionInServiceArgs = {
  organization_id?: InputMaybe<Scalars['ID']['input']>;
  service_id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddUserArgs = {
  input: AddUserInput;
};


export type MutationAddUserServiceArgs = {
  input: UserServiceInput;
};


export type MutationChangeSelectedOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
};


export type MutationDeleteDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  serviceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubscriptionArgs = {
  subscription_id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserServiceArgs = {
  input: UserServiceInput;
};


export type MutationEditDocumentArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  newDescription?: InputMaybe<Scalars['String']['input']>;
  serviceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: EditOrganizationInput;
};


export type MutationEditServiceArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationEditServiceCapabilityArgs = {
  input?: InputMaybe<EditServiceCapabilityInput>;
};


export type MutationEditUserArgs = {
  id: Scalars['ID']['input'];
  input: EditUserInput;
};


export type MutationFrontendErrorLogArgs = {
  codeStack?: InputMaybe<Scalars['String']['input']>;
  componentStack?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMergeTestArgs = {
  from: Scalars['ID']['input'];
  target: Scalars['ID']['input'];
};


export type MutationRemoveUserFromOrganizationArgs = {
  organization_id: Scalars['ID']['input'];
  user_id: Scalars['ID']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export enum OrderingMode {
  Asc = 'asc',
  Desc = 'desc'
}

export type Organization = Node & {
  __typename?: 'Organization';
  domains?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  personal_space: Scalars['Boolean']['output'];
};

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

export type Query = {
  __typename?: 'Query';
  documentExists?: Maybe<Scalars['Boolean']['output']>;
  documents: DocumentConnection;
  me?: Maybe<User>;
  node?: Maybe<Node>;
  organization?: Maybe<Organization>;
  organizations: OrganizationConnection;
  publicServices: ServiceConnection;
  rolePortal?: Maybe<RolePortal>;
  rolesPortal: Array<RolePortal>;
  serviceById?: Maybe<Service>;
  serviceByIdWithSubscriptions?: Maybe<Service>;
  serviceUsers?: Maybe<UserServiceConnection>;
  services: ServiceConnection;
  settings: Settings;
  user?: Maybe<User>;
  userHasSomeSubscription: Scalars['Boolean']['output'];
  userServiceOwned?: Maybe<UserServiceConnection>;
  users: UserConnection;
};


export type QueryDocumentExistsArgs = {
  documentName?: InputMaybe<Scalars['String']['input']>;
  serviceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDocumentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  serviceId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: OrganizationOrdering;
  orderMode: OrderingMode;
};


export type QueryPublicServicesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceOrdering;
  orderMode: OrderingMode;
};


export type QueryRolePortalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryServiceByIdArgs = {
  service_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceByIdWithSubscriptionsArgs = {
  service_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryServiceUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
};


export type QueryServicesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceOrdering;
  orderMode: OrderingMode;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserServiceOwnedArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<UserFilter>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
};

export enum Restriction {
  BckManageCommunities = 'BCK_MANAGE_COMMUNITIES',
  BckManageServices = 'BCK_MANAGE_SERVICES',
  Bypass = 'BYPASS',
  FrtAccessBilling = 'FRT_ACCESS_BILLING',
  FrtAccessServices = 'FRT_ACCESS_SERVICES',
  FrtManageSettings = 'FRT_MANAGE_SETTINGS',
  FrtManageUser = 'FRT_MANAGE_USER',
  FrtServiceSubscriber = 'FRT_SERVICE_SUBSCRIBER'
}

export type RolePortal = Node & {
  __typename?: 'RolePortal';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Service = Node & {
  __typename?: 'Service';
  capabilities?: Maybe<Array<Scalars['String']['output']>>;
  creation_status?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  join_type?: Maybe<Scalars['String']['output']>;
  links?: Maybe<Array<Maybe<ServiceLink>>>;
  name: Scalars['String']['output'];
  organization?: Maybe<Array<Maybe<Organization>>>;
  provider?: Maybe<Scalars['String']['output']>;
  public?: Maybe<Scalars['Boolean']['output']>;
  subscribed?: Maybe<Scalars['Boolean']['output']>;
  subscriptions?: Maybe<Array<Maybe<Subscription>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ServiceCapability = Node & {
  __typename?: 'ServiceCapability';
  id: Scalars['ID']['output'];
  service_capability_name?: Maybe<Scalars['String']['output']>;
  user_service_id: Scalars['ID']['output'];
};

export type ServiceConnection = {
  __typename?: 'ServiceConnection';
  edges: Array<ServiceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ServiceEdge = {
  __typename?: 'ServiceEdge';
  cursor: Scalars['String']['output'];
  node: Service;
};

export type ServiceLink = Node & {
  __typename?: 'ServiceLink';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  service_id?: Maybe<Scalars['ID']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum ServiceOrdering {
  Description = 'description',
  Name = 'name',
  Provider = 'provider',
  Type = 'type'
}

export type ServicePrice = Node & {
  __typename?: 'ServicePrice';
  fee_type?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  price?: Maybe<Scalars['Int']['output']>;
  service_id?: Maybe<Scalars['ID']['output']>;
  start_date?: Maybe<Scalars['Date']['output']>;
};

export enum ServiceRestriction {
  AccessUser = 'ACCESS_USER',
  ManageAccess = 'MANAGE_ACCESS'
}

export type ServiceSubscription = {
  __typename?: 'ServiceSubscription';
  add?: Maybe<Service>;
  delete?: Maybe<Service>;
  edit?: Maybe<Service>;
};

export type Settings = {
  __typename?: 'Settings';
  platform_providers: Array<PlatformProvider>;
};

export type Subscription = Node & {
  __typename?: 'Subscription';
  ActionTracking?: Maybe<TrackingSubscription>;
  Service?: Maybe<ServiceSubscription>;
  User?: Maybe<UserSubscription>;
  end_date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  organization: Organization;
  organization_id: Scalars['ID']['output'];
  service?: Maybe<Service>;
  service_id: Scalars['ID']['output'];
  service_url: Scalars['String']['output'];
  start_date?: Maybe<Scalars['Date']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  user_service: Array<Maybe<UserService>>;
};

export type SubscriptionByService = {
  __typename?: 'SubscriptionByService';
  service?: Maybe<Service>;
  subscriptions: Array<Subscription>;
};

export type SubscriptionEdge = {
  __typename?: 'SubscriptionEdge';
  cursor: Scalars['String']['output'];
  node: Subscription;
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

export type TrackingSubscription = {
  __typename?: 'TrackingSubscription';
  add?: Maybe<ActionTracking>;
  delete?: Maybe<ActionTracking>;
  edit?: Maybe<ActionTracking>;
};

export type User = Node & {
  __typename?: 'User';
  capabilities?: Maybe<Array<Capability>>;
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  organizations?: Maybe<Array<Organization>>;
  roles_portal?: Maybe<Array<RolePortal>>;
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

export type UserFilter = {
  organization?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export enum UserOrdering {
  Email = 'email',
  FirstName = 'first_name',
  LastName = 'last_name'
}

export type UserService = Node & {
  __typename?: 'UserService';
  id: Scalars['ID']['output'];
  service_capability?: Maybe<Array<Maybe<ServiceCapability>>>;
  subscription?: Maybe<Subscription>;
  subscription_id: Scalars['ID']['output'];
  user?: Maybe<User>;
  user_id: Scalars['ID']['output'];
};

export type UserServiceConnection = {
  __typename?: 'UserServiceConnection';
  edges: Array<UserServiceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
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

export type UserServiceInput = {
  capabilities?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  email: Scalars['String']['input'];
  subscriptionId: Scalars['String']['input'];
};

export enum UserServiceOrdering {
  Email = 'email',
  FirstName = 'first_name',
  LastName = 'last_name',
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


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
  Node: ( ActionTracking ) | ( Capability ) | ( Document ) | ( MergeEvent ) | ( MessageTracking ) | ( Organization ) | ( RolePortal ) | ( Service ) | ( ServiceCapability ) | ( ServiceLink ) | ( ServicePrice ) | ( Subscription ) | ( User ) | ( UserService ) | ( UserServiceDeleted );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ActionTracking: ResolverTypeWrapper<ActionTracking>;
  AddServiceInput: AddServiceInput;
  AddServicePriceInput: AddServicePriceInput;
  AddUserInput: AddUserInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Capability: ResolverTypeWrapper<Capability>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  Document: ResolverTypeWrapper<Document>;
  DocumentConnection: ResolverTypeWrapper<DocumentConnection>;
  DocumentEdge: ResolverTypeWrapper<DocumentEdge>;
  DocumentOrdering: DocumentOrdering;
  EditOrganizationInput: EditOrganizationInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUserInput: EditUserInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  MergeEvent: ResolverTypeWrapper<MergeEvent>;
  MessageTracking: ResolverTypeWrapper<MessageTracking>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  OrderingMode: OrderingMode;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationConnection: ResolverTypeWrapper<OrganizationConnection>;
  OrganizationEdge: ResolverTypeWrapper<OrganizationEdge>;
  OrganizationOrdering: OrganizationOrdering;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PlatformProvider: ResolverTypeWrapper<PlatformProvider>;
  Query: ResolverTypeWrapper<{}>;
  Restriction: Restriction;
  RolePortal: ResolverTypeWrapper<RolePortal>;
  Service: ResolverTypeWrapper<Service>;
  ServiceCapability: ResolverTypeWrapper<ServiceCapability>;
  ServiceConnection: ResolverTypeWrapper<ServiceConnection>;
  ServiceEdge: ResolverTypeWrapper<ServiceEdge>;
  ServiceLink: ResolverTypeWrapper<ServiceLink>;
  ServiceOrdering: ServiceOrdering;
  ServicePrice: ResolverTypeWrapper<ServicePrice>;
  ServiceRestriction: ServiceRestriction;
  ServiceSubscription: ResolverTypeWrapper<ServiceSubscription>;
  Settings: ResolverTypeWrapper<Settings>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionByService: ResolverTypeWrapper<SubscriptionByService>;
  SubscriptionEdge: ResolverTypeWrapper<SubscriptionEdge>;
  SubscriptionOrdering: SubscriptionOrdering;
  TrackingSubscription: ResolverTypeWrapper<TrackingSubscription>;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<User>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserFilter: UserFilter;
  UserOrdering: UserOrdering;
  UserService: ResolverTypeWrapper<UserService>;
  UserServiceConnection: ResolverTypeWrapper<UserServiceConnection>;
  UserServiceDeleted: ResolverTypeWrapper<UserServiceDeleted>;
  UserServiceEdge: ResolverTypeWrapper<UserServiceEdge>;
  UserServiceInput: UserServiceInput;
  UserServiceOrdering: UserServiceOrdering;
  UserSubscription: ResolverTypeWrapper<UserSubscription>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActionTracking: ActionTracking;
  AddServiceInput: AddServiceInput;
  AddServicePriceInput: AddServicePriceInput;
  AddUserInput: AddUserInput;
  Boolean: Scalars['Boolean']['output'];
  Capability: Capability;
  Date: Scalars['Date']['output'];
  Document: Document;
  DocumentConnection: DocumentConnection;
  DocumentEdge: DocumentEdge;
  EditOrganizationInput: EditOrganizationInput;
  EditServiceCapabilityInput: EditServiceCapabilityInput;
  EditUserInput: EditUserInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  MergeEvent: MergeEvent;
  MessageTracking: MessageTracking;
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  Organization: Organization;
  OrganizationConnection: OrganizationConnection;
  OrganizationEdge: OrganizationEdge;
  PageInfo: PageInfo;
  PlatformProvider: PlatformProvider;
  Query: {};
  RolePortal: RolePortal;
  Service: Service;
  ServiceCapability: ServiceCapability;
  ServiceConnection: ServiceConnection;
  ServiceEdge: ServiceEdge;
  ServiceLink: ServiceLink;
  ServicePrice: ServicePrice;
  ServiceSubscription: ServiceSubscription;
  Settings: Settings;
  String: Scalars['String']['output'];
  Subscription: {};
  SubscriptionByService: SubscriptionByService;
  SubscriptionEdge: SubscriptionEdge;
  TrackingSubscription: TrackingSubscription;
  Upload: Scalars['Upload']['output'];
  User: User;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserFilter: UserFilter;
  UserService: UserService;
  UserServiceConnection: UserServiceConnection;
  UserServiceDeleted: UserServiceDeleted;
  UserServiceEdge: UserServiceEdge;
  UserServiceInput: UserServiceInput;
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

export type CapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['Restriction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DocumentResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  download_number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  file_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minio_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  service_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uploader_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

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
  addDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationAddDocumentArgs>>;
  addOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationAddOrganizationArgs, 'name'>>;
  addService?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, Partial<MutationAddServiceArgs>>;
  addServicePrice?: Resolver<Maybe<ResolversTypes['ServicePrice']>, ParentType, ContextType, Partial<MutationAddServicePriceArgs>>;
  addSubscription?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, Partial<MutationAddSubscriptionArgs>>;
  addSubscriptionInService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, Partial<MutationAddSubscriptionInServiceArgs>>;
  addUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddUserArgs, 'input'>>;
  addUserService?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationAddUserServiceArgs, 'input'>>;
  changeSelectedOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationChangeSelectedOrganizationArgs, 'organization_id'>>;
  deleteDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationDeleteDocumentArgs>>;
  deleteOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationDeleteOrganizationArgs, 'id'>>;
  deleteService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationDeleteServiceArgs, 'id'>>;
  deleteSubscription?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationDeleteSubscriptionArgs, 'subscription_id'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  deleteUserService?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, RequireFields<MutationDeleteUserServiceArgs, 'input'>>;
  editDocument?: Resolver<ResolversTypes['Document'], ParentType, ContextType, Partial<MutationEditDocumentArgs>>;
  editOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationEditOrganizationArgs, 'id' | 'input'>>;
  editService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationEditServiceArgs, 'id' | 'name'>>;
  editServiceCapability?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType, Partial<MutationEditServiceCapabilityArgs>>;
  editUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditUserArgs, 'id' | 'input'>>;
  frontendErrorLog?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationFrontendErrorLogArgs, 'message'>>;
  login?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email'>>;
  logout?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mergeTest?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationMergeTestArgs, 'from' | 'target'>>;
  removeUserFromOrganization?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromOrganizationArgs, 'organization_id' | 'user_id'>>;
}>;

export type NodeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActionTracking' | 'Capability' | 'Document' | 'MergeEvent' | 'MessageTracking' | 'Organization' | 'RolePortal' | 'Service' | 'ServiceCapability' | 'ServiceLink' | 'ServicePrice' | 'Subscription' | 'User' | 'UserService' | 'UserServiceDeleted', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type OrganizationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = ResolversObject<{
  domains?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personal_space?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  documentExists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, Partial<QueryDocumentExistsArgs>>;
  documents?: Resolver<ResolversTypes['DocumentConnection'], ParentType, ContextType, RequireFields<QueryDocumentsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryOrganizationArgs, 'id'>>;
  organizations?: Resolver<ResolversTypes['OrganizationConnection'], ParentType, ContextType, RequireFields<QueryOrganizationsArgs, 'first' | 'orderBy' | 'orderMode'>>;
  publicServices?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryPublicServicesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  rolePortal?: Resolver<Maybe<ResolversTypes['RolePortal']>, ParentType, ContextType, RequireFields<QueryRolePortalArgs, 'id'>>;
  rolesPortal?: Resolver<Array<ResolversTypes['RolePortal']>, ParentType, ContextType>;
  serviceById?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, Partial<QueryServiceByIdArgs>>;
  serviceByIdWithSubscriptions?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, Partial<QueryServiceByIdWithSubscriptionsArgs>>;
  serviceUsers?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryServiceUsersArgs, 'first' | 'id' | 'orderBy' | 'orderMode'>>;
  services?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryServicesArgs, 'first' | 'orderBy' | 'orderMode'>>;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userHasSomeSubscription?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userServiceOwned?: Resolver<Maybe<ResolversTypes['UserServiceConnection']>, ParentType, ContextType, RequireFields<QueryUserServiceOwnedArgs, 'first' | 'orderBy' | 'orderMode'>>;
  users?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'first' | 'orderBy' | 'orderMode'>>;
}>;

export type RolePortalResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['RolePortal'] = ResolversParentTypes['RolePortal']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Service'] = ResolversParentTypes['Service']> = ResolversObject<{
  capabilities?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  creation_status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  join_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  links?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceLink']>>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<Maybe<Array<Maybe<ResolversTypes['Organization']>>>, ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  public?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  subscriptions?: Resolver<Maybe<Array<Maybe<ResolversTypes['Subscription']>>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceCapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceCapability'] = ResolversParentTypes['ServiceCapability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_capability_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user_service_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceConnection'] = ResolversParentTypes['ServiceConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ServiceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceEdge'] = ResolversParentTypes['ServiceEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Service'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceLinkResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceLink'] = ResolversParentTypes['ServiceLink']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  service_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServicePriceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServicePrice'] = ResolversParentTypes['ServicePrice']> = ResolversObject<{
  fee_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  service_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceSubscription'] = ResolversParentTypes['ServiceSubscription']> = ResolversObject<{
  add?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  delete?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SettingsResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = ResolversObject<{
  platform_providers?: Resolver<Array<ResolversTypes['PlatformProvider']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  ActionTracking?: SubscriptionResolver<Maybe<ResolversTypes['TrackingSubscription']>, "ActionTracking", ParentType, ContextType>;
  Service?: SubscriptionResolver<Maybe<ResolversTypes['ServiceSubscription']>, "Service", ParentType, ContextType>;
  User?: SubscriptionResolver<Maybe<ResolversTypes['UserSubscription']>, "User", ParentType, ContextType>;
  end_date?: SubscriptionResolver<Maybe<ResolversTypes['Date']>, "end_date", ParentType, ContextType>;
  id?: SubscriptionResolver<ResolversTypes['ID'], "id", ParentType, ContextType>;
  organization?: SubscriptionResolver<ResolversTypes['Organization'], "organization", ParentType, ContextType>;
  organization_id?: SubscriptionResolver<ResolversTypes['ID'], "organization_id", ParentType, ContextType>;
  service?: SubscriptionResolver<Maybe<ResolversTypes['Service']>, "service", ParentType, ContextType>;
  service_id?: SubscriptionResolver<ResolversTypes['ID'], "service_id", ParentType, ContextType>;
  service_url?: SubscriptionResolver<ResolversTypes['String'], "service_url", ParentType, ContextType>;
  start_date?: SubscriptionResolver<Maybe<ResolversTypes['Date']>, "start_date", ParentType, ContextType>;
  status?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "status", ParentType, ContextType>;
  user_service?: SubscriptionResolver<Array<Maybe<ResolversTypes['UserService']>>, "user_service", ParentType, ContextType>;
}>;

export type SubscriptionByServiceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscriptionByService'] = ResolversParentTypes['SubscriptionByService']> = ResolversObject<{
  service?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  subscriptions?: Resolver<Array<ResolversTypes['Subscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['SubscriptionEdge'] = ResolversParentTypes['SubscriptionEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Subscription'], ParentType, ContextType>;
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
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organizations?: Resolver<Maybe<Array<ResolversTypes['Organization']>>, ParentType, ContextType>;
  roles_portal?: Resolver<Maybe<Array<ResolversTypes['RolePortal']>>, ParentType, ContextType>;
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

export type UserServiceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserService'] = ResolversParentTypes['UserService']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service_capability?: Resolver<Maybe<Array<Maybe<ResolversTypes['ServiceCapability']>>>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType>;
  subscription_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  Capability?: CapabilityResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Document?: DocumentResolvers<ContextType>;
  DocumentConnection?: DocumentConnectionResolvers<ContextType>;
  DocumentEdge?: DocumentEdgeResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  MergeEvent?: MergeEventResolvers<ContextType>;
  MessageTracking?: MessageTrackingResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationConnection?: OrganizationConnectionResolvers<ContextType>;
  OrganizationEdge?: OrganizationEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PlatformProvider?: PlatformProviderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RolePortal?: RolePortalResolvers<ContextType>;
  Service?: ServiceResolvers<ContextType>;
  ServiceCapability?: ServiceCapabilityResolvers<ContextType>;
  ServiceConnection?: ServiceConnectionResolvers<ContextType>;
  ServiceEdge?: ServiceEdgeResolvers<ContextType>;
  ServiceLink?: ServiceLinkResolvers<ContextType>;
  ServicePrice?: ServicePriceResolvers<ContextType>;
  ServiceSubscription?: ServiceSubscriptionResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionByService?: SubscriptionByServiceResolvers<ContextType>;
  SubscriptionEdge?: SubscriptionEdgeResolvers<ContextType>;
  TrackingSubscription?: TrackingSubscriptionResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserService?: UserServiceResolvers<ContextType>;
  UserServiceConnection?: UserServiceConnectionResolvers<ContextType>;
  UserServiceDeleted?: UserServiceDeletedResolvers<ContextType>;
  UserServiceEdge?: UserServiceEdgeResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = PortalContext> = ResolversObject<{
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  service_capa?: Service_CapaDirectiveResolver<any, any, ContextType>;
}>;
