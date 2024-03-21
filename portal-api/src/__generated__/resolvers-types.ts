import type { GraphQLResolveInfo } from 'graphql';
import { PortalContext } from '../model/portal-context';

export type Maybe<T> = T|null|undefined;
export type InputMaybe<T> = T|null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K>&{ [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K>&{ [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T|{ [P in keyof T]?: P extends ' $fragmentName'|'__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K>&{ [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddUserInput = {
  email: Scalars['String']['input'];
  organization_id: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Capability = Node&{
  __typename?: 'Capability';
  id: Scalars['ID']['output'];
  name: Restriction;
};

export type EditUserInput = {
  email: Scalars['String']['input'];
  first_name?: InputMaybe<Scalars['String']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_id: Scalars['String']['input'];
};

export type MergeEvent = Node&{
  __typename?: 'MergeEvent';
  from: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  target: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addOrganization?: Maybe<Organization>;
  addService?: Maybe<Service>;
  addUser?: Maybe<User>;
  deleteService?: Maybe<Service>;
  deleteUser?: Maybe<User>;
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


export type MutationAddUserArgs = {
  input: AddUserInput;
};


export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
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
  Desc = 'desc'
}

export type Organization = Node&{
  __typename?: 'Organization';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type OrganizationConnection = {
  __typename?: 'OrganizationConnection';
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
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

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  node?: Maybe<Node>;
  organization?: Maybe<Organization>;
  organizations: OrganizationConnection;
  services: ServiceConnection;
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


export type QueryServicesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: ServiceOrdering;
  orderMode: OrderingMode;
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
  Bypass = 'BYPASS',
  User = 'USER'
}

export type Service = Node&{
  __typename?: 'Service';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ServiceConnection = {
  __typename?: 'ServiceConnection';
  edges: Array<ServiceEdge>;
  pageInfo: PageInfo;
};

export type ServiceEdge = {
  __typename?: 'ServiceEdge';
  cursor: Scalars['String']['output'];
  node: Service;
};

export enum ServiceOrdering {
  Name = 'name'
}

export type ServiceSubscription = {
  __typename?: 'ServiceSubscription';
  add?: Maybe<Service>;
  delete?: Maybe<Service>;
  edit?: Maybe<Service>;
};

export type Subscription = {
  __typename?: 'Subscription';
  Service?: Maybe<ServiceSubscription>;
  User?: Maybe<UserSubscription>;
};

export type User = Node&{
  __typename?: 'User';
  capabilities: Array<Capability>;
  email: Scalars['String']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  organization: Organization;
  organization_id: Scalars['ID']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export enum UserOrdering {
  Email = 'email'
}

export type UserSubscription = {
  __typename?: 'UserSubscription';
  add?: Maybe<User>;
  delete?: Maybe<User>;
  edit?: Maybe<User>;
  merge?: Maybe<MergeEvent>;
};

export type WithIndex<TObject> = TObject&Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T>|T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  ResolverFn<TResult, TParent, TContext, TArgs>
  |ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult>|TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult>|Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult|Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  |SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  |SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  |((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  |SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes>|Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean|Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult|Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Node: (Capability)|(MergeEvent)|(Organization)|(Service)|(User);
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddUserInput: AddUserInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Capability: ResolverTypeWrapper<Capability>;
  EditUserInput: EditUserInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MergeEvent: ResolverTypeWrapper<MergeEvent>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  OrderingMode: OrderingMode;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationConnection: ResolverTypeWrapper<OrganizationConnection>;
  OrganizationEdge: ResolverTypeWrapper<OrganizationEdge>;
  OrganizationOrdering: OrganizationOrdering;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  Restriction: Restriction;
  Service: ResolverTypeWrapper<Service>;
  ServiceConnection: ResolverTypeWrapper<ServiceConnection>;
  ServiceEdge: ResolverTypeWrapper<ServiceEdge>;
  ServiceOrdering: ServiceOrdering;
  ServiceSubscription: ResolverTypeWrapper<ServiceSubscription>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
  UserConnection: ResolverTypeWrapper<UserConnection>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserOrdering: UserOrdering;
  UserSubscription: ResolverTypeWrapper<UserSubscription>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddUserInput: AddUserInput;
  Boolean: Scalars['Boolean']['output'];
  Capability: Capability;
  EditUserInput: EditUserInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  MergeEvent: MergeEvent;
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  Organization: Organization;
  OrganizationConnection: OrganizationConnection;
  OrganizationEdge: OrganizationEdge;
  PageInfo: PageInfo;
  Query: {};
  Service: Service;
  ServiceConnection: ServiceConnection;
  ServiceEdge: ServiceEdge;
  ServiceSubscription: ServiceSubscription;
  String: Scalars['String']['output'];
  Subscription: {};
  User: User;
  UserConnection: UserConnection;
  UserEdge: UserEdge;
  UserSubscription: UserSubscription;
}>;

export type AuthDirectiveArgs = {
  requires?: Maybe<Array<Maybe<Restriction>>>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = PortalContext, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CapabilityResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['Restriction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MergeEventResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['MergeEvent'] = ResolversParentTypes['MergeEvent']> = ResolversObject<{
  from?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationAddOrganizationArgs, 'name'>>;
  addService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationAddServiceArgs, 'name'>>;
  addUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddUserArgs, 'input'>>;
  deleteService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationDeleteServiceArgs, 'id'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  editService?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType, RequireFields<MutationEditServiceArgs, 'id'|'name'>>;
  editUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationEditUserArgs, 'id'|'input'>>;
  login?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email'>>;
  logout?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mergeTest?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationMergeTestArgs, 'from'|'target'>>;
}>;

export type NodeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Capability'|'MergeEvent'|'Organization'|'Service'|'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type OrganizationResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrganizationConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['OrganizationConnection'] = ResolversParentTypes['OrganizationConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['OrganizationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
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

export type QueryResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryOrganizationArgs, 'id'>>;
  organizations?: Resolver<ResolversTypes['OrganizationConnection'], ParentType, ContextType, RequireFields<QueryOrganizationsArgs, 'first'|'orderBy'|'orderMode'>>;
  services?: Resolver<ResolversTypes['ServiceConnection'], ParentType, ContextType, RequireFields<QueryServicesArgs, 'first'|'orderBy'|'orderMode'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'first'|'orderBy'|'orderMode'>>;
}>;

export type ServiceResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Service'] = ResolversParentTypes['Service']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceConnection'] = ResolversParentTypes['ServiceConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ServiceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceEdge'] = ResolversParentTypes['ServiceEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Service'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ServiceSubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['ServiceSubscription'] = ResolversParentTypes['ServiceSubscription']> = ResolversObject<{
  add?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  delete?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  edit?: Resolver<Maybe<ResolversTypes['Service']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  Service?: SubscriptionResolver<Maybe<ResolversTypes['ServiceSubscription']>, 'Service', ParentType, ContextType>;
  User?: SubscriptionResolver<Maybe<ResolversTypes['UserSubscription']>, 'User', ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  capabilities?: Resolver<Array<ResolversTypes['Capability']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organization_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEdgeResolvers<ContextType = PortalContext, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
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
  Capability?: CapabilityResolvers<ContextType>;
  MergeEvent?: MergeEventResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationConnection?: OrganizationConnectionResolvers<ContextType>;
  OrganizationEdge?: OrganizationEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Service?: ServiceResolvers<ContextType>;
  ServiceConnection?: ServiceConnectionResolvers<ContextType>;
  ServiceEdge?: ServiceEdgeResolvers<ContextType>;
  ServiceSubscription?: ServiceSubscriptionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = PortalContext> = ResolversObject<{
  auth?: AuthDirectiveResolver<any, any, ContextType>;
}>;
