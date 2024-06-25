import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import type { PortalContext } from '../model/portal-context.js';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
  JSON: { input: any; output: any };
};

export type ActionTracking = Node & {
  __typename?: 'ActionTracking';
  contextual_id: Scalars['String']['output'];
  created_at: Scalars['Date']['output'];
  ended_at?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  message_tracking: Array<MessageTracking>;
  status?: Maybe<Scalars['String']['output']>;
};

export type AddUserInput = {
  email: Scalars['String']['input'];
  first_name: Scalars['String']['input'];
  last_name: Scalars['String']['input'];
  organization_id: Scalars['String']['input'];
  password: Scalars['String']['input'];
  roles_id: Array<InputMaybe<Scalars['String']['input']>>;
};

export type Capability = Node & {
  __typename?: 'Capability';
  id: Scalars['ID']['output'];
  name: Restriction;
};

export type EditOrganizationInput = {
  name: Scalars['String']['input'];
};

export type EditUserInput = {
  email: Scalars['String']['input'];
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_id: Scalars['String']['input'];
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
  addOrganization?: Maybe<Organization>;
  addService?: Maybe<Service>;
  addSubscription?: Maybe<Subscription>;
  addUser?: Maybe<User>;
  deleteOrganization?: Maybe<Organization>;
  deleteService?: Maybe<Service>;
  deleteUser?: Maybe<User>;
  editOrganization?: Maybe<Organization>;
  editService?: Maybe<Service>;
  editUser?: Maybe<User>;
  login?: Maybe<User>;
  logout: Scalars['ID']['output'];
  mergeTest: Scalars['ID']['output'];
};

export type MutationAddOrganizationArgs = {
  name: Scalars['String']['input'];
};

export type MutationAddServiceArgs = {
  name: Scalars['String']['input'];
};

export type MutationAddSubscriptionArgs = {
  organization_id?: InputMaybe<Scalars['String']['input']>;
  service_id?: InputMaybe<Scalars['String']['input']>;
};

export type MutationAddUserArgs = {
  input: AddUserInput;
};

export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationEditOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: EditOrganizationInput;
};

export type MutationEditServiceArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type MutationEditUserArgs = {
  id: Scalars['ID']['input'];
  input: EditUserInput;
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};

export type MutationMergeTestArgs = {
  from: Scalars['ID']['input'];
  target: Scalars['ID']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export enum OrderingMode {
  Asc = 'asc',
  Desc = 'desc',
}

export type Organization = Node & {
  __typename?: 'Organization';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
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
  Name = 'name',
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
  me?: Maybe<User>;
  node?: Maybe<Node>;
  organization?: Maybe<Organization>;
  organizations: OrganizationConnection;
  rolePortal?: Maybe<RolePortal>;
  rolesPortal: Array<RolePortal>;
  services: ServiceConnection;
  settings: Settings;
  subscription?: Maybe<Subscription>;
  subscriptions: SubscriptionConnection;
  user?: Maybe<User>;
  users: UserConnection;
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
  orderBy?: InputMaybe<OrganizationOrdering>;
  orderMode?: InputMaybe<OrderingMode>;
};

export type QueryRolePortalArgs = {
  id: Scalars['ID']['input'];
};

export type QueryServicesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceOrdering;
  orderMode: OrderingMode;
};

export type QuerySubscriptionArgs = {
  id: Scalars['ID']['input'];
};

export type QuerySubscriptionsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<SubscriptionOrdering>;
  orderMode?: InputMaybe<OrderingMode>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
};

export enum Restriction {
  Admin = 'ADMIN',
  AdminOrga = 'ADMIN_ORGA',
  Bypass = 'BYPASS',
  User = 'USER',
}

export type RolePortal = Node & {
  __typename?: 'RolePortal';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type RolePortalId = Node & {
  __typename?: 'RolePortalID';
  id: Scalars['ID']['output'];
};

export type Service = Node & {
  __typename?: 'Service';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  provider?: Maybe<Scalars['String']['output']>;
  subscription_type?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
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

export enum ServiceOrdering {
  Name = 'name',
}

export type Settings = {
  __typename?: 'Settings';
  platform_providers: Array<PlatformProvider>;
};

export type Subscription = Node & {
  __typename?: 'Subscription';
  end_date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  organization?: Maybe<Organization>;
  organization_id: Scalars['ID']['output'];
  service?: Maybe<Service>;
  service_id: Scalars['ID']['output'];
  start_date?: Maybe<Scalars['Date']['output']>;
};

export type SubscriptionConnection = {
  __typename?: 'SubscriptionConnection';
  edges: Array<SubscriptionEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SubscriptionEdge = {
  __typename?: 'SubscriptionEdge';
  cursor: Scalars['String']['output'];
  node: Subscription;
};

export enum SubscriptionOrdering {
  OrganizationId = 'organization_id',
}

export type TrackingSubscription = {
  __typename?: 'TrackingSubscription';
  add?: Maybe<ActionTracking>;
  delete?: Maybe<ActionTracking>;
  edit?: Maybe<ActionTracking>;
};

export type User = Node & {
  __typename?: 'User';
  capabilities: Array<Capability>;
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  organization: Organization;
  organization_id: Scalars['ID']['output'];
  roles_portal_id: Array<RolePortalId>;
  tracking_data?: Maybe<Array<Maybe<ActionTracking>>>;
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
  node?: Maybe<User>;
};

export enum UserOrdering {
  Email = 'email',
  FirstName = 'first_name',
  LastName = 'last_name',
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> =
  ResolversObject<{
    Node:
      | ActionTracking
      | Capability
      | MergeEvent
      | MessageTracking
      | Organization
      | RolePortal
      | RolePortalId
      | Service
      | Subscription
      | User;
  }>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ActionTracking: ResolverTypeWrapper<ActionTracking>;
  AddUserInput: AddUserInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Capability: ResolverTypeWrapper<Capability>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  EditOrganizationInput: EditOrganizationInput;
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
  RolePortalID: ResolverTypeWrapper<RolePortalId>;
  Service: ResolverTypeWrapper<Service>;
  ServiceConnection: ResolverTypeWrapper<ServiceConnection>;
  ServiceEdge: ResolverTypeWrapper<ServiceEdge>;
  ServiceOrdering: ServiceOrdering;
  Settings: ResolverTypeWrapper<Settings>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionConnection: ResolverTypeWrapper<SubscriptionConnection>;
  SubscriptionEdge: ResolverTypeWrapper<SubscriptionEdge>;
  SubscriptionOrdering: SubscriptionOrdering;
  TrackingSubscription: ResolverTypeWrapper<TrackingSubscription>;
  User: ResolverTypeWrapper<User>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserOrdering: UserOrdering;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActionTracking: ActionTracking;
  AddUserInput: AddUserInput;
  Boolean: Scalars['Boolean']['output'];
  Capability: Capability;
  Date: Scalars['Date']['output'];
  EditOrganizationInput: EditOrganizationInput;
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
  RolePortalID: RolePortalId;
  Service: Service;
  ServiceConnection: ServiceConnection;
  ServiceEdge: ServiceEdge;
  Settings: Settings;
  String: Scalars['String']['output'];
  Subscription: {};
  SubscriptionConnection: SubscriptionConnection;
  SubscriptionEdge: SubscriptionEdge;
  TrackingSubscription: TrackingSubscription;
  User: User;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
}>;

export type AuthDirectiveArgs = {
  requires?: Maybe<Array<Maybe<Restriction>>>;
};

export type AuthDirectiveResolver<
  Result,
  Parent,
  ContextType = PortalContext,
  Args = AuthDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ActionTrackingResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['ActionTracking'] = ResolversParentTypes['ActionTracking'],
> = ResolversObject<{
  contextual_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  ended_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message_tracking?: Resolver<
    Array<ResolversTypes['MessageTracking']>,
    ParentType,
    ContextType
  >;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CapabilityResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Capability'] = ResolversParentTypes['Capability'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['Restriction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MergeEventResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['MergeEvent'] = ResolversParentTypes['MergeEvent'],
> = ResolversObject<{
  from?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageTrackingResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['MessageTracking'] = ResolversParentTypes['MessageTracking'],
> = ResolversObject<{
  created_at?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  technical?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  tracking_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  tracking_info?: Resolver<
    Maybe<ResolversTypes['JSON']>,
    ParentType,
    ContextType
  >;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = ResolversObject<{
  addOrganization?: Resolver<
    Maybe<ResolversTypes['Organization']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddOrganizationArgs, 'name'>
  >;
  addService?: Resolver<
    Maybe<ResolversTypes['Service']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddServiceArgs, 'name'>
  >;
  addSubscription?: Resolver<
    Maybe<ResolversTypes['Subscription']>,
    ParentType,
    ContextType,
    Partial<MutationAddSubscriptionArgs>
  >;
  addUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddUserArgs, 'input'>
  >;
  deleteOrganization?: Resolver<
    Maybe<ResolversTypes['Organization']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteOrganizationArgs, 'id'>
  >;
  deleteService?: Resolver<
    Maybe<ResolversTypes['Service']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteServiceArgs, 'id'>
  >;
  deleteUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteUserArgs, 'id'>
  >;
  editOrganization?: Resolver<
    Maybe<ResolversTypes['Organization']>,
    ParentType,
    ContextType,
    RequireFields<MutationEditOrganizationArgs, 'id' | 'input'>
  >;
  editService?: Resolver<
    Maybe<ResolversTypes['Service']>,
    ParentType,
    ContextType,
    RequireFields<MutationEditServiceArgs, 'id' | 'name'>
  >;
  editUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationEditUserArgs, 'id' | 'input'>
  >;
  login?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationLoginArgs, 'email'>
  >;
  logout?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mergeTest?: Resolver<
    ResolversTypes['ID'],
    ParentType,
    ContextType,
    RequireFields<MutationMergeTestArgs, 'from' | 'target'>
  >;
}>;

export type NodeResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Node'] = ResolversParentTypes['Node'],
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | 'ActionTracking'
    | 'Capability'
    | 'MergeEvent'
    | 'MessageTracking'
    | 'Organization'
    | 'RolePortal'
    | 'RolePortalID'
    | 'Service'
    | 'Subscription'
    | 'User',
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type OrganizationResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Organization'] = ResolversParentTypes['Organization'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationConnectionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['OrganizationConnection'] = ResolversParentTypes['OrganizationConnection'],
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes['OrganizationEdge']>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationEdgeResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['OrganizationEdge'] = ResolversParentTypes['OrganizationEdge'],
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PageInfoResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo'],
> = ResolversObject<{
  endCursor?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  startCursor?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlatformProviderResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['PlatformProvider'] = ResolversParentTypes['PlatformProvider'],
> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<
    Maybe<ResolversTypes['Node']>,
    ParentType,
    ContextType,
    RequireFields<QueryNodeArgs, 'id'>
  >;
  organization?: Resolver<
    Maybe<ResolversTypes['Organization']>,
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationArgs, 'id'>
  >;
  organizations?: Resolver<
    ResolversTypes['OrganizationConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryOrganizationsArgs, 'first' | 'orderBy' | 'orderMode'>
  >;
  rolePortal?: Resolver<
    Maybe<ResolversTypes['RolePortal']>,
    ParentType,
    ContextType,
    RequireFields<QueryRolePortalArgs, 'id'>
  >;
  rolesPortal?: Resolver<
    Array<ResolversTypes['RolePortal']>,
    ParentType,
    ContextType
  >;
  services?: Resolver<
    ResolversTypes['ServiceConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryServicesArgs, 'first' | 'orderBy' | 'orderMode'>
  >;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
  subscription?: Resolver<
    Maybe<ResolversTypes['Subscription']>,
    ParentType,
    ContextType,
    RequireFields<QuerySubscriptionArgs, 'id'>
  >;
  subscriptions?: Resolver<
    ResolversTypes['SubscriptionConnection'],
    ParentType,
    ContextType,
    RequireFields<QuerySubscriptionsArgs, 'first' | 'orderMode'>
  >;
  user?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QueryUserArgs, 'id'>
  >;
  users?: Resolver<
    ResolversTypes['UserConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryUsersArgs, 'first' | 'orderBy' | 'orderMode'>
  >;
}>;

export type RolePortalResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['RolePortal'] = ResolversParentTypes['RolePortal'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RolePortalIdResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['RolePortalID'] = ResolversParentTypes['RolePortalID'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Service'] = ResolversParentTypes['Service'],
> = ResolversObject<{
  description?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  provider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscription_type?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceConnectionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['ServiceConnection'] = ResolversParentTypes['ServiceConnection'],
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes['ServiceEdge']>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceEdgeResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['ServiceEdge'] = ResolversParentTypes['ServiceEdge'],
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Service'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SettingsResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Settings'] = ResolversParentTypes['Settings'],
> = ResolversObject<{
  platform_providers?: Resolver<
    Array<ResolversTypes['PlatformProvider']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription'],
> = ResolversObject<{
  end_date?: SubscriptionResolver<
    Maybe<ResolversTypes['Date']>,
    'end_date',
    ParentType,
    ContextType
  >;
  id?: SubscriptionResolver<
    ResolversTypes['ID'],
    'id',
    ParentType,
    ContextType
  >;
  organization?: SubscriptionResolver<
    Maybe<ResolversTypes['Organization']>,
    'organization',
    ParentType,
    ContextType
  >;
  organization_id?: SubscriptionResolver<
    ResolversTypes['ID'],
    'organization_id',
    ParentType,
    ContextType
  >;
  service?: SubscriptionResolver<
    Maybe<ResolversTypes['Service']>,
    'service',
    ParentType,
    ContextType
  >;
  service_id?: SubscriptionResolver<
    ResolversTypes['ID'],
    'service_id',
    ParentType,
    ContextType
  >;
  start_date?: SubscriptionResolver<
    Maybe<ResolversTypes['Date']>,
    'start_date',
    ParentType,
    ContextType
  >;
}>;

export type SubscriptionConnectionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['SubscriptionConnection'] = ResolversParentTypes['SubscriptionConnection'],
> = ResolversObject<{
  edges?: Resolver<
    Array<ResolversTypes['SubscriptionEdge']>,
    ParentType,
    ContextType
  >;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionEdgeResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['SubscriptionEdge'] = ResolversParentTypes['SubscriptionEdge'],
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Subscription'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TrackingSubscriptionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['TrackingSubscription'] = ResolversParentTypes['TrackingSubscription'],
> = ResolversObject<{
  add?: Resolver<
    Maybe<ResolversTypes['ActionTracking']>,
    ParentType,
    ContextType
  >;
  delete?: Resolver<
    Maybe<ResolversTypes['ActionTracking']>,
    ParentType,
    ContextType
  >;
  edit?: Resolver<
    Maybe<ResolversTypes['ActionTracking']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = ResolversObject<{
  capabilities?: Resolver<
    Array<ResolversTypes['Capability']>,
    ParentType,
    ContextType
  >;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  last_name?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  organization?: Resolver<
    ResolversTypes['Organization'],
    ParentType,
    ContextType
  >;
  organization_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  roles_portal_id?: Resolver<
    Array<ResolversTypes['RolePortalID']>,
    ParentType,
    ContextType
  >;
  tracking_data?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['ActionTracking']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection'],
> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEdgeResolvers<
  ContextType = PortalContext,
  ParentType extends
    ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge'],
> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = PortalContext> = ResolversObject<{
  ActionTracking?: ActionTrackingResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  Date?: GraphQLScalarType;
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
  RolePortalID?: RolePortalIdResolvers<ContextType>;
  Service?: ServiceResolvers<ContextType>;
  ServiceConnection?: ServiceConnectionResolvers<ContextType>;
  ServiceEdge?: ServiceEdgeResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionConnection?: SubscriptionConnectionResolvers<ContextType>;
  SubscriptionEdge?: SubscriptionEdgeResolvers<ContextType>;
  TrackingSubscription?: TrackingSubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = PortalContext> = ResolversObject<{
  auth?: AuthDirectiveResolver<any, any, ContextType>;
}>;
