import type { GraphQLClient, RequestOptions } from "graphql-request";
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
import { useQuery, useInfiniteQuery, useMutation, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, UseMutationOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

function fetcher<TData, TVariables extends { [key: string]: any }>(client: GraphQLClient, query: string, variables?: TVariables, requestHeaders?: RequestInit['headers']) {
  return async (): Promise<TData> => client.request({
    document: query,
    variables,
    requestHeaders
  });
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A Relay global ID for Competitor, extracted to a branded CompetitorId string */
  CompetitorId: { input: any; output: any; }
  Date: { input: any; output: any; }
  /** A Relay global ID for DeploymentRequest, extracted to a branded DeploymentRequestId string */
  DeploymentRequestId: { input: any; output: any; }
  /** A Relay global ID for Document, extracted to a branded DocumentId string */
  DocumentId: { input: any; output: any; }
  JSON: { input: any; output: any; }
  /** A Relay global ID for NewsFeedItem, extracted to a branded NewsFeedItemId string */
  NewsFeedItemId: { input: any; output: any; }
  /** A Relay global ID for Organization, extracted to a branded OrganizationId string */
  OrganizationId: { input: any; output: any; }
  /** A Relay global ID for ServiceGroup, extracted to a branded ServiceGroupId string */
  ServiceGroupId: { input: any; output: any; }
  /** A Relay global ID for ServiceInstance, extracted to a branded ServiceInstanceId string */
  ServiceInstanceId: { input: any; output: any; }
  /** A Relay global ID for Service_Capability, extracted to a branded Service_CapabilityId string */
  Service_CapabilityId: { input: any; output: any; }
  /** A Relay global ID for Subscription, extracted to a branded SubscriptionId string */
  SubscriptionId: { input: any; output: any; }
  Upload: { input: any; output: any; }
  /** A Relay global ID for UseCase, extracted to a branded UseCaseId string */
  UseCaseId: { input: any; output: any; }
  /** A Relay global ID for User, extracted to a branded UserId string */
  UserId: { input: any; output: any; }
  /** A Relay global ID for User_Service, extracted to a branded User_ServiceId string */
  User_ServiceId: { input: any; output: any; }
};

export type AddServiceInput = {
  fee_type: InputMaybe<Scalars['String']['input']>;
  organization_id: InputMaybe<Scalars['String']['input']>;
  price: InputMaybe<Scalars['Int']['input']>;
  service_instance_description: InputMaybe<Scalars['String']['input']>;
  service_instance_name: InputMaybe<Scalars['String']['input']>;
  url: InputMaybe<Scalars['String']['input']>;
};

export type AddSubscriptionCapabilityInput = {
  capabilitiesId: Array<Scalars['Service_CapabilityId']['input']>;
  subscriptionsId: Array<Scalars['SubscriptionId']['input']>;
};

export type AddUseCaseInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
  product: InputMaybe<Array<FiligranProduct>>;
};

export type AddUserInput = {
  capabilities: InputMaybe<Array<Scalars['String']['input']>>;
  email: Scalars['String']['input'];
  password: InputMaybe<Scalars['String']['input']>;
};

export type AdminAddUserInput = {
  email: Scalars['String']['input'];
  first_name: InputMaybe<Scalars['String']['input']>;
  last_name: InputMaybe<Scalars['String']['input']>;
  organization_capabilities: InputMaybe<Array<OrganizationCapabilitiesInput>>;
  password: InputMaybe<Scalars['String']['input']>;
};

export type AdminEditUserInput = {
  disabled: InputMaybe<Scalars['Boolean']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  first_name: InputMaybe<Scalars['String']['input']>;
  last_name: InputMaybe<Scalars['String']['input']>;
  organization_capabilities: InputMaybe<Array<OrganizationCapabilitiesInput>>;
};

export type AutoRegisterPlatformInput = {
  existing_users_count: InputMaybe<Scalars['Int']['input']>;
  platform: PlatformInput;
};

export type BulkPendingUserFromOrganizationInput = {
  excludedIds: InputMaybe<Array<Scalars['UserId']['input']>>;
  filters: InputMaybe<Array<Filter>>;
  ids: InputMaybe<Array<Scalars['UserId']['input']>>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};

export type CanUnregisterPlatformInput = {
  platformId: Scalars['String']['input'];
  tenantId: InputMaybe<Scalars['String']['input']>;
};

export type CanUnregisterResponse = {
  __typename?: 'CanUnregisterResponse';
  isAllowed: Maybe<Scalars['Boolean']['output']>;
  isInOrganization: Maybe<Scalars['Boolean']['output']>;
  isPlatformRegistered: Scalars['Boolean']['output'];
  organizationId: Maybe<Scalars['OrganizationId']['output']>;
};

export type Capability = Node & {
  __typename?: 'Capability';
  id: Scalars['ID']['output'];
  name: PortalCapability;
};

export type Competitor = Node & {
  __typename?: 'Competitor';
  domain: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tier: CompetitorTier;
};

export type CompetitorConnection = {
  __typename?: 'CompetitorConnection';
  edges: Array<CompetitorEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompetitorEdge = {
  __typename?: 'CompetitorEdge';
  cursor: Scalars['String']['output'];
  node: Competitor;
};

export enum CompetitorOrdering {
  Domain = 'domain',
  Name = 'name',
  Tier = 'tier'
}

export enum CompetitorTier {
  Tier1 = 'tier1',
  Tier2 = 'tier2',
  Tier3 = 'tier3'
}

export type Connector = Document & Integration & Node & {
  __typename?: 'Connector';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  container_image: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  manager_supported: Scalars['Boolean']['output'];
  minimum_deployable_version: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  playbook_supported: Scalars['Boolean']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  source_code: Maybe<Scalars['String']['output']>;
  subscription: Maybe<SubscriptionModel>;
  subscription_link: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
  verified: Scalars['Boolean']['output'];
};

export type ConsumeProvisionedNewsFeedItemsResponse = {
  __typename?: 'ConsumeProvisionedNewsFeedItemsResponse';
  available_news_feed_types: Array<NewsFeedItemType>;
  news_feed_items: Array<ProvisionedNewsFeedItem>;
};

export type CreateCompetitorInput = {
  domain: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tier: CompetitorTier;
};

export type CreateDeploymentRequestInput = {
  activity_sector: InputMaybe<DeploymentRequestActivitySector>;
  job_title: InputMaybe<DeploymentRequestJobTitle>;
  platform_identifier: PlatformIdentifier;
  region: DeploymentRequestPlatformRegion;
  source: DeploymentRequestSource;
  type: DeploymentRequestDeploymentType;
  use_case: InputMaybe<DeploymentRequestUseCase>;
};

export type CreateDocumentInput = {
  active: Scalars['Boolean']['input'];
  description: Scalars['String']['input'];
  entity_types: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  uploader_id: Scalars['UserId']['input'];
  use_cases: InputMaybe<Array<Scalars['UseCaseId']['input']>>;
};

export type CreateEpicInput = {
  active: InputMaybe<Scalars['Boolean']['input']>;
  description: Scalars['String']['input'];
  edition_type: EditionType;
  illustration_document: InputMaybe<Scalars['Upload']['input']>;
  is_integration: InputMaybe<Scalars['Boolean']['input']>;
  product: FiligranProduct;
  short_description: Scalars['String']['input'];
  timeline: Timeline;
  title: Scalars['String']['input'];
};

export type CreateSubscriptionsInput = {
  capability_ids: InputMaybe<Array<Scalars['Service_CapabilityId']['input']>>;
  end_date: InputMaybe<Scalars['Date']['input']>;
  organization_id: Array<Scalars['OrganizationId']['input']>;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
  start_date: Scalars['Date']['input'];
};

export type CsvFeed = Document & Integration & Node & {
  __typename?: 'CsvFeed';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  feed_url: Maybe<Scalars['String']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type CustomDashboard = Document & Node & {
  __typename?: 'CustomDashboard';
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type CustomView = Document & Node & {
  __typename?: 'CustomView';
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  entity_types: Maybe<Array<Scalars['String']['output']>>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

/**
 * /!\ WARNING Do not use this type.
 * It exists only to cover cases where we failed to map to a specific Document.
 */
export type DefaultDocument = Document & Node & {
  __typename?: 'DefaultDocument';
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type DeployedPlatform = {
  __typename?: 'DeployedPlatform';
  platformIdentifier: PlatformIdentifier;
  serviceInstanceId: Scalars['ServiceInstanceId']['output'];
};

export type DeployedResource = {
  __typename?: 'DeployedResource';
  deployedAt: Scalars['Date']['output'];
  deployedBy: Maybe<User>;
  document: Document;
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
  activity_sector: Maybe<DeploymentRequestActivitySector>;
  cancellation_date: Maybe<Scalars['Date']['output']>;
  cancellation_reason: Maybe<Scalars['String']['output']>;
  cancellation_user_email: Maybe<Scalars['String']['output']>;
  counts_in_orga_quota: Scalars['Boolean']['output'];
  end_date: Maybe<Scalars['Date']['output']>;
  hub_status: DeploymentRequestHubStatus;
  id: Scalars['ID']['output'];
  job_title: Maybe<DeploymentRequestJobTitle>;
  ordering: Scalars['Int']['output'];
  organization_name: Maybe<Scalars['String']['output']>;
  organization_requester_id: Scalars['OrganizationId']['output'];
  platform_id: Maybe<Scalars['String']['output']>;
  platform_identifier: PlatformIdentifier;
  platform_url: Maybe<Scalars['String']['output']>;
  region: DeploymentRequestPlatformRegion;
  request_date: Scalars['Date']['output'];
  requester_email: Maybe<Scalars['String']['output']>;
  service_instance_id: Scalars['ServiceInstanceId']['output'];
  start_date: Maybe<Scalars['Date']['output']>;
  type: DeploymentRequestDeploymentType;
  use_case: Maybe<DeploymentRequestUseCase>;
};

export enum DeploymentRequestActivitySector {
  ComputerGames = 'computer_games',
  ComputerNetworkSecurity = 'computer_network_security',
  ComputerSoftware = 'computer_software',
  DefenseSpace = 'defense_space',
  Entertainment = 'entertainment',
  FinancialServices = 'financial_services',
  GovernmentAdministration = 'government_administration',
  GovernmentRelations = 'government_relations',
  HigherEducation = 'higher_education',
  HospitalHealthCare = 'hospital_health_care',
  Hospitality = 'hospitality',
  InformationTechnology = 'information_technology',
  Insurance = 'insurance',
  LegalServices = 'legal_services',
  LuxuryGoodsJewelry = 'luxury_goods_jewelry',
  ManagementConsulting = 'management_consulting',
  MarketingAdvertising = 'marketing_advertising',
  Military = 'military',
  NonProfit = 'non_profit',
  OilEnergy = 'oil_energy',
  Pharmaceuticals = 'pharmaceuticals',
  Photography = 'photography',
  Retail = 'retail',
  SecurityInvestigations = 'security_investigations',
  Semiconductors = 'semiconductors',
  Telecommunications = 'telecommunications',
  Transportation = 'transportation',
  Utilities = 'utilities',
  Wireless = 'wireless'
}

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
  key: InputMaybe<DeploymentRequestFilterKey>;
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

export enum DeploymentRequestJobTitle {
  ApplicationSecuritySpecialist = 'application_security_specialist',
  CLevel = 'c_level',
  Ceo = 'ceo',
  CisoCsoCio = 'ciso_cso_cio',
  CloudSecuritySpecialist = 'cloud_security_specialist',
  Consultant = 'consultant',
  CybersecurityArchitect = 'cybersecurity_architect',
  CybersecurityEngineer = 'cybersecurity_engineer',
  CybersecurityTeamLead = 'cybersecurity_team_lead',
  DfirSpecialist = 'dfir_specialist',
  DirectorHeadCybersecurity = 'director_head_cybersecurity',
  GeneralManagerVp = 'general_manager_vp',
  GrcSpecialist = 'grc_specialist',
  IamSpecialist = 'iam_specialist',
  Other = 'other',
  PenetrationTester = 'penetration_tester',
  SocAnalyst = 'soc_analyst',
  ThreatIntelligenceAnalyst = 'threat_intelligence_analyst',
  VulnerabilityAnalyst = 'vulnerability_analyst'
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

export enum DeploymentRequestSource {
  OpenaevDemo = 'openaev_demo',
  OpenctiDemo = 'opencti_demo',
  Xtmhub = 'xtmhub'
}

export enum DeploymentRequestUseCase {
  AttackSimulation = 'attack_simulation',
  CentralizingKnowledge = 'centralizing_knowledge',
  CrisisSimulation = 'crisis_simulation',
  DetectionEngineering = 'detection_engineering',
  HostingThreatCommunity = 'hosting_threat_community',
  IncidentResponse = 'incident_response',
  OaevAtomicTesting = 'oaev_atomic_testing',
  OaevAttackSimulation = 'oaev_attack_simulation',
  OaevCtemFramework = 'oaev_ctem_framework',
  OaevOpenctiCoverage = 'oaev_opencti_coverage',
  OaevPenetrationTesting = 'oaev_penetration_testing',
  OaevPlatformValidation = 'oaev_platform_validation',
  OaevPurpleTeam = 'oaev_purple_team',
  OaevTabletopExercise = 'oaev_tabletop_exercise',
  SecurityStack = 'security_stack',
  SharingKnowledge = 'sharing_knowledge',
  StrategicReporting = 'strategic_reporting',
  TechnicalReporting = 'technical_reporting',
  ThreatHunting = 'threat_hunting',
  ThreatProfilingCti = 'threat_profiling_cti',
  ThreatProfilingFaml = 'threat_profiling_faml',
  ThreatProfilingFimi = 'threat_profiling_fimi',
  ThreatProfilingLeo = 'threat_profiling_leo',
  VulnerabilityManagement = 'vulnerability_management'
}

export type Document = {
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
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

export enum DocumentImageType {
  Image = 'image',
  Logo = 'logo'
}

export type DocumentMetadata = {
  key: DocumentMetadataKeyCode;
  value: Scalars['String']['input'];
};

export enum DocumentMetadataKeyCode {
  AdditionalProperties = 'additional_properties',
  BlogpostUrl = 'blogpost_url',
  ConfigSchema = 'config_schema',
  ContainerImage = 'container_image',
  DatasheetUrl = 'datasheet_url',
  DemoUrl = 'demo_url',
  EntityTypes = 'entity_types',
  FeedUrl = 'feed_url',
  GithubUrl = 'github_url',
  ImageName = 'image_name',
  ImageType = 'image_type',
  IntegrationSubtype = 'integration_subtype',
  IntegrationType = 'integration_type',
  LastVerifiedDate = 'last_verified_date',
  ManagerSupported = 'manager_supported',
  ManifestFragmentId = 'manifest_fragment_id',
  MinimumDeployableVersion = 'minimum_deployable_version',
  MinimumDeployableVersionPadded = 'minimum_deployable_version_padded',
  PlaybookSupported = 'playbook_supported',
  ProductVersion = 'product_version',
  SourceCode = 'source_code',
  SubscriptionLink = 'subscription_link',
  VendorUrl = 'vendor_url',
  Verified = 'verified',
  VersionPadded = 'version_padded'
}

export enum DocumentOrdering {
  CreatedAt = 'created_at',
  Description = 'description',
  DownloadNumber = 'download_number',
  FileName = 'file_name',
  Name = 'name',
  UpdatedAt = 'updated_at'
}

export enum DocumentSourceType {
  External = 'external',
  Internal = 'internal'
}

export type EditMeUserInput = {
  country: InputMaybe<Scalars['String']['input']>;
  first_name: InputMaybe<Scalars['String']['input']>;
  last_name: InputMaybe<Scalars['String']['input']>;
  selected_language: InputMaybe<Scalars['String']['input']>;
};

export type EditServiceCapabilityInput = {
  capabilities: Array<InputMaybe<Scalars['String']['input']>>;
  user_service_id: InputMaybe<Scalars['User_ServiceId']['input']>;
};

export type EditUseCaseInput = {
  color: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  product: InputMaybe<Array<FiligranProduct>>;
};

export type EditUserCapabilitiesInput = {
  capabilities: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum EditionType {
  CommunityEdition = 'community_edition',
  EnterpriseEdition = 'enterprise_edition',
  PartialEe = 'partial_ee'
}

export type Epic = Node & {
  __typename?: 'Epic';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Date']['output'];
  description: Scalars['String']['output'];
  document: Maybe<Document>;
  document_id: Maybe<Scalars['DocumentId']['output']>;
  edition_type: EditionType;
  epic_type: EpicType;
  id: Scalars['ID']['output'];
  product: FiligranProduct;
  short_description: Scalars['String']['output'];
  timeline: Timeline;
  title: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader_id: Scalars['String']['output'];
};

export type EpicConnection = {
  __typename?: 'EpicConnection';
  edges: Array<EpicEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EpicCountPerTimeline = {
  __typename?: 'EpicCountPerTimeline';
  count: Scalars['Int']['output'];
  timeline: Timeline;
};

export type EpicEdge = {
  __typename?: 'EpicEdge';
  cursor: Scalars['String']['output'];
  node: Epic;
};

export enum EpicOrdering {
  Title = 'title'
}

export enum EpicType {
  Integration = 'integration',
  Other = 'other'
}

export enum FeatureFlag {
  Dummy = 'DUMMY',
  HomePageV2 = 'HOME_PAGE_V2'
}

export enum FiligranProduct {
  Openaev = 'openaev',
  Opencti = 'opencti',
  Xtmhub = 'xtmhub',
  Xtmone = 'xtmone'
}

export type Filter = {
  key: FilterKey;
  value: Array<Scalars['String']['input']>;
};

export enum FilterKey {
  EntityType = 'entity_type',
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
  name: Maybe<Scalars['String']['output']>;
};

export type Integration = {
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type IntegrationHack = Document & Integration & Node & {
  __typename?: 'IntegrationHack';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export enum IntegrationSubType {
  CaseManagement = 'CASE_MANAGEMENT',
  CyberIndustry = 'CYBER_INDUSTRY',
  Darkweb = 'DARKWEB',
  Detection = 'DETECTION',
  ExternalImport = 'EXTERNAL_IMPORT',
  FederalOrganization = 'FEDERAL_ORGANIZATION',
  InternalEnrichment = 'INTERNAL_ENRICHMENT',
  InternalExportFile = 'INTERNAL_EXPORT_FILE',
  InternalImportFile = 'INTERNAL_IMPORT_FILE',
  Journalists = 'JOURNALISTS',
  Malware = 'MALWARE',
  Native = 'NATIVE',
  NotForProfitOrganization = 'NOT_FOR_PROFIT_ORGANIZATION',
  Orchestration = 'ORCHESTRATION',
  PeriodicBriefing = 'PERIODIC_BRIEFING',
  SecurityResearcher = 'SECURITY_RESEARCHER',
  SocialMedia = 'SOCIAL_MEDIA',
  Stream = 'STREAM',
  ThreatActors = 'THREAT_ACTORS',
  Vendors = 'VENDORS'
}

export enum IntegrationType {
  Connector = 'connector',
  CsvFeed = 'csv_feed',
  RssFeed = 'rss_feed',
  Stream = 'stream',
  TaxiiFeed = 'taxii_feed',
  ThirdPartyIntegration = 'third_party_integration'
}

export type IsPlatformRegisteredInput = {
  platformId: Scalars['String']['input'];
  tenantId: InputMaybe<Scalars['String']['input']>;
};

export type IsPlatformRegisteredOrganization = Node & {
  __typename?: 'IsPlatformRegisteredOrganization';
  id: Scalars['ID']['output'];
};

export type IsPlatformRegisteredResponse = {
  __typename?: 'IsPlatformRegisteredResponse';
  organization: Maybe<IsPlatformRegisteredOrganization>;
  platformTitle: Maybe<Scalars['String']['output']>;
  status: PlatformRegistrationStatus;
};

export type LastDeployedOverview = {
  __typename?: 'LastDeployedOverview';
  resources: Array<DeployedResource>;
};

export type LogicalFilterInput = {
  children: InputMaybe<Array<LogicalFilterInput>>;
  leaf: InputMaybe<Filter>;
  operator: InputMaybe<LogicalOperator>;
};

export enum LogicalOperator {
  And = 'AND',
  Or = 'OR'
}

export type ManifestFragmentInput = {
  additional_properties: Scalars['JSON']['input'];
  config_schema: Scalars['JSON']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  image_name: Scalars['String']['input'];
  image_type: Scalars['String']['input'];
  integration_type: Scalars['String']['input'];
  last_verified_date: Scalars['String']['input'];
  logo: Scalars['String']['input'];
  manager_supported: Scalars['Boolean']['input'];
  min_version: Scalars['String']['input'];
  platform: Scalars['String']['input'];
  short_description: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  source_code: Scalars['String']['input'];
  subscription_link: Scalars['String']['input'];
  title: Scalars['String']['input'];
  use_cases: Array<Scalars['String']['input']>;
  verified: InputMaybe<Scalars['Boolean']['input']>;
  version: Scalars['String']['input'];
};

export enum ManifestType {
  Connector = 'connector'
}

export type MeUserSubscription = {
  __typename?: 'MeUserSubscription';
  delete: Maybe<User>;
  edit: Maybe<User>;
};

export type MergeEvent = Node & {
  __typename?: 'MergeEvent';
  from: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  target: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addCapabilitiesToUserServices: Maybe<Array<Maybe<UserService>>>;
  addOrganization: Maybe<Organization>;
  addServicePicture: Maybe<ServiceInstance>;
  addSubscription: Maybe<ServiceInstance>;
  addSubscriptionCapability: Array<SubscriptionModel>;
  addUseCase: UseCase;
  addUser: Maybe<User>;
  addUserService: Maybe<Array<Maybe<UserService>>>;
  adminAddUser: Maybe<User>;
  adminCancelDeploymentRequest: Maybe<DeploymentRequest>;
  adminEditUser: User;
  autoRegisterPlatform: Success;
  bulkAcceptPendingUserInOrganization: Maybe<Success>;
  bulkRemovePendingUserFromOrganization: Maybe<Success>;
  cancelDeploymentRequest: Maybe<DeploymentRequest>;
  changeSelectedOrganization: Maybe<User>;
  consumeProvisionedNewsFeedItems: ConsumeProvisionedNewsFeedItemsResponse;
  contactUs: Success;
  createCompetitor: Competitor;
  createDeploymentRequest: DeploymentRequest;
  createDocument: Document;
  createEpic: Epic;
  createSubscriptions: Array<SubscriptionModel>;
  deleteCompetitor: Competitor;
  deleteDocument: Document;
  deleteEpic: Maybe<Epic>;
  deleteNewsFeedItem: Scalars['Boolean']['output'];
  deleteOrganization: Maybe<Organization>;
  deleteSubscriptions: Array<SubscriptionModel>;
  deleteUseCase: UseCase;
  deleteUserServices: Maybe<Array<Maybe<UserService>>>;
  editMeUser: User;
  editOrganization: Maybe<Organization>;
  editServiceCapability: Maybe<SubscriptionModel>;
  editUseCase: UseCase;
  editUserCapabilities: User;
  editUserService: Maybe<UserService>;
  frontendErrorLog: Maybe<Scalars['Boolean']['output']>;
  generateManifest: Success;
  incrementShareNumberDocument: Document;
  ingestManifestFragments: Success;
  login: Maybe<User>;
  logout: Scalars['ID']['output'];
  newProductVersion: Success;
  refreshPlatformRegistrationConnectivityStatus: RefreshPlatformRegistrationConnectivityStatusResponse;
  refreshPlatformRegistrationConnectivityStatusAllTenants: RefreshPlatformRegistrationConnectivityStatusAllTenantsResponse;
  refreshPlatformRegistrationConnectivityStatusSingleTenant: RefreshPlatformRegistrationConnectivityStatusResponse;
  refreshUserPlatformToken: RefreshUserPlatformTokenResponse;
  registerPlatform: RegistrationResponse;
  removePendingUserFromOrganization: Maybe<User>;
  removeUserFromOrganization: Maybe<User>;
  reorderDeploymentRequestInQueue: Success;
  requestTransferPersonalSpace: Success;
  resetPassword: Success;
  sendTelemetryEvent: Maybe<SendTelemetryMutation>;
  transferPersonalSpace: Success;
  unregisterPlatform: Success;
  updateCompetitor: Competitor;
  updateDeploymentQuotaCapacity: Success;
  updateDeploymentRequest: PlatformDeploymentRequest;
  updateDocument: Document;
  updateEpic: Epic;
  updatePlatformServiceMetadata: Maybe<RegisteredPlatform>;
  updateServiceGroups: Array<ServiceGroup>;
  updateSubscription: Maybe<SubscriptionModel>;
  uploadUserPicture: User;
};


export type MutationAddCapabilitiesToUserServicesArgs = {
  input: UserServicesAddCapabilitiesInput;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type MutationAddOrganizationArgs = {
  input: OrganizationInput;
};


export type MutationAddServicePictureArgs = {
  document: InputMaybe<Scalars['Upload']['input']>;
  isLogo: Scalars['Boolean']['input'];
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};


export type MutationAddSubscriptionArgs = {
  service_instance_id: InputMaybe<Scalars['ServiceInstanceId']['input']>;
};


export type MutationAddSubscriptionCapabilityArgs = {
  input: AddSubscriptionCapabilityInput;
};


export type MutationAddUseCaseArgs = {
  input: AddUseCaseInput;
};


export type MutationAddUserArgs = {
  input: AddUserInput;
};


export type MutationAddUserServiceArgs = {
  input: UserServiceAddInput;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type MutationAdminAddUserArgs = {
  input: AdminAddUserInput;
};


export type MutationAdminCancelDeploymentRequestArgs = {
  deploymentRequestId: Scalars['DeploymentRequestId']['input'];
};


export type MutationAdminEditUserArgs = {
  id: Scalars['ID']['input'];
  input: AdminEditUserInput;
};


export type MutationAutoRegisterPlatformArgs = {
  input: InputMaybe<AutoRegisterPlatformInput>;
  platform: InputMaybe<PlatformInput>;
};


export type MutationBulkAcceptPendingUserInOrganizationArgs = {
  input: BulkPendingUserFromOrganizationInput;
};


export type MutationBulkRemovePendingUserFromOrganizationArgs = {
  input: BulkPendingUserFromOrganizationInput;
};


export type MutationCancelDeploymentRequestArgs = {
  cancellationReason: InputMaybe<Scalars['String']['input']>;
  deploymentRequestId: Scalars['DeploymentRequestId']['input'];
};


export type MutationChangeSelectedOrganizationArgs = {
  organization_id: Scalars['OrganizationId']['input'];
};


export type MutationContactUsArgs = {
  message: InputMaybe<Scalars['String']['input']>;
  platformId: InputMaybe<Scalars['ID']['input']>;
  platformIdentifier: InputMaybe<PlatformIdentifier>;
};


export type MutationCreateCompetitorArgs = {
  input: CreateCompetitorInput;
};


export type MutationCreateDeploymentRequestArgs = {
  input: CreateDeploymentRequestInput;
};


export type MutationCreateDocumentArgs = {
  images: InputMaybe<Array<Scalars['Upload']['input']>>;
  input: CreateDocumentInput;
  logo: InputMaybe<Scalars['Upload']['input']>;
  metadata: Array<DocumentMetadata>;
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
  sourceDocument: InputMaybe<Scalars['Upload']['input']>;
};


export type MutationCreateEpicArgs = {
  document: InputMaybe<Array<Scalars['Upload']['input']>>;
  input: CreateEpicInput;
};


export type MutationCreateSubscriptionsArgs = {
  input: CreateSubscriptionsInput;
};


export type MutationDeleteCompetitorArgs = {
  id: Scalars['CompetitorId']['input'];
};


export type MutationDeleteDocumentArgs = {
  documentId: Scalars['DocumentId']['input'];
  forceDelete: InputMaybe<Scalars['Boolean']['input']>;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type MutationDeleteEpicArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNewsFeedItemArgs = {
  id: Scalars['NewsFeedItemId']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubscriptionsArgs = {
  subscription_ids: Array<Scalars['SubscriptionId']['input']>;
};


export type MutationDeleteUseCaseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserServicesArgs = {
  input: UserServicesDeleteInput;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type MutationEditMeUserArgs = {
  input: EditMeUserInput;
};


export type MutationEditOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: OrganizationInput;
};


export type MutationEditServiceCapabilityArgs = {
  input: InputMaybe<EditServiceCapabilityInput>;
  serviceInstanceId: InputMaybe<Scalars['ServiceInstanceId']['input']>;
};


export type MutationEditUseCaseArgs = {
  id: Scalars['ID']['input'];
  input: EditUseCaseInput;
};


export type MutationEditUserCapabilitiesArgs = {
  id: Scalars['ID']['input'];
  input: EditUserCapabilitiesInput;
};


export type MutationEditUserServiceArgs = {
  input: UserServiceEditInput;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type MutationFrontendErrorLogArgs = {
  codeStack: InputMaybe<Scalars['String']['input']>;
  componentStack: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
};


export type MutationGenerateManifestArgs = {
  product: PlatformIdentifier;
  type: ManifestType;
  version: Scalars['String']['input'];
};


export type MutationIncrementShareNumberDocumentArgs = {
  documentId: Scalars['DocumentId']['input'];
};


export type MutationIngestManifestFragmentsArgs = {
  manifestFragments: Array<ManifestFragmentInput>;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: InputMaybe<Scalars['String']['input']>;
};


export type MutationNewProductVersionArgs = {
  product: PlatformIdentifier;
  version: Scalars['String']['input'];
};


export type MutationRefreshPlatformRegistrationConnectivityStatusArgs = {
  input: RefreshPlatformRegistrationConnectivityStatusInput;
};


export type MutationRefreshPlatformRegistrationConnectivityStatusAllTenantsArgs = {
  input: RefreshPlatformRegistrationConnectivityStatusAllTenantsInput;
};


export type MutationRefreshPlatformRegistrationConnectivityStatusSingleTenantArgs = {
  input: RefreshPlatformRegistrationConnectivityStatusSingleTenantInput;
};


export type MutationRegisterPlatformArgs = {
  input: RegisterPlatformInput;
};


export type MutationRemovePendingUserFromOrganizationArgs = {
  organization_id: Scalars['OrganizationId']['input'];
  user_id: Scalars['UserId']['input'];
};


export type MutationRemoveUserFromOrganizationArgs = {
  organization_id: Scalars['OrganizationId']['input'];
  user_id: Scalars['UserId']['input'];
};


export type MutationReorderDeploymentRequestInQueueArgs = {
  input: ReorderDeploymentRequestInQueueInput;
};


export type MutationRequestTransferPersonalSpaceArgs = {
  new_email: Scalars['String']['input'];
};


export type MutationTransferPersonalSpaceArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationUnregisterPlatformArgs = {
  input: UnregisterPlatformInput;
};


export type MutationUpdateCompetitorArgs = {
  input: UpdateCompetitorInput;
};


export type MutationUpdateDeploymentQuotaCapacityArgs = {
  input: UpdateDeploymentQuotaCapacityInput;
};


export type MutationUpdateDeploymentRequestArgs = {
  input: UpdateDeploymentRequestInput;
};


export type MutationUpdateDocumentArgs = {
  documentId: Scalars['DocumentId']['input'];
  existingImageIds: InputMaybe<Array<Scalars['DocumentId']['input']>>;
  images: InputMaybe<Array<Scalars['Upload']['input']>>;
  input: UpdateDocumentInput;
  logo: InputMaybe<Scalars['Upload']['input']>;
  metadata: Array<DocumentMetadata>;
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
  sourceDocument: InputMaybe<Scalars['Upload']['input']>;
};


export type MutationUpdateEpicArgs = {
  document: InputMaybe<Array<Scalars['Upload']['input']>>;
  id: Scalars['ID']['input'];
  input: UpdateEpicInput;
};


export type MutationUpdatePlatformServiceMetadataArgs = {
  document: InputMaybe<Scalars['Upload']['input']>;
  input: UpdatePlatformServiceMetadataInput;
};


export type MutationUpdateServiceGroupsArgs = {
  input: UpdateServiceGroupsInput;
};


export type MutationUpdateSubscriptionArgs = {
  input: UpdateSubscriptionInput;
  subscription_id: Scalars['SubscriptionId']['input'];
};


export type MutationUploadUserPictureArgs = {
  document: Scalars['Upload']['input'];
};

export type NewsFeedItem = Node & {
  __typename?: 'NewsFeedItem';
  creation_date: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  is_deleted: Scalars['Boolean']['output'];
  metadata: Array<NewsFeedItemMetadata>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: NewsFeedItemType;
};

export type NewsFeedItemConnection = {
  __typename?: 'NewsFeedItemConnection';
  edges: Array<NewsFeedItemEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type NewsFeedItemEdge = {
  __typename?: 'NewsFeedItemEdge';
  cursor: Scalars['String']['output'];
  node: NewsFeedItem;
};

export type NewsFeedItemMetadata = {
  __typename?: 'NewsFeedItemMetadata';
  key: NewsFeedItemMetadataKey;
  value: Maybe<Scalars['String']['output']>;
};

export enum NewsFeedItemMetadataKey {
  DocumentId = 'document_id',
  UrlPath = 'url_path'
}

export enum NewsFeedItemType {
  ResourceCustomDashboard = 'RESOURCE_CUSTOM_DASHBOARD',
  ResourceCustomView = 'RESOURCE_CUSTOM_VIEW',
  ResourcePlaybook = 'RESOURCE_PLAYBOOK'
}

export type Node = {
  id: Scalars['ID']['output'];
};

export type OneClickDeployInput = {
  platform_identifier: PlatformIdentifier;
  platform_service_instance_id: Scalars['ID']['input'];
  resource_id: Scalars['DocumentId']['input'];
  resource_title: Scalars['String']['input'];
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};

export type OpenAevScenario = Document & Node & {
  __typename?: 'OpenAEVScenario';
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type OpenCtiPlatformRegistrationStatusInput = {
  platformId: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type OpenCtiPlatformRegistrationStatusResponse = {
  __typename?: 'OpenCTIPlatformRegistrationStatusResponse';
  status: PlatformRegistrationConnectivityStatus;
};

export type OpenCtiPlaybook = Document & Node & {
  __typename?: 'OpenCTIPlaybook';
  active: Scalars['Boolean']['output'];
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export enum OrderingMode {
  Asc = 'asc',
  Desc = 'desc'
}

export type Organization = Node & {
  __typename?: 'Organization';
  capabilityUser: Maybe<Array<Maybe<Capability>>>;
  domains: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  personal_space: Scalars['Boolean']['output'];
};

export type OrganizationCapabilities = Node & {
  __typename?: 'OrganizationCapabilities';
  capabilities: Maybe<Array<OrganizationCapability>>;
  id: Scalars['ID']['output'];
  organization: Organization;
};

export type OrganizationCapabilitiesInput = {
  capabilities: InputMaybe<Array<Scalars['String']['input']>>;
  organization_id: Scalars['OrganizationId']['input'];
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

export type OrganizationInput = {
  domains: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
};

export enum OrganizationOrdering {
  Name = 'name'
}

export type OrganizationRef = Node & {
  __typename?: 'OrganizationRef';
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

export enum PlatformConfigurationStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export enum PlatformContract {
  Ce = 'CE',
  Ee = 'EE',
  Trial = 'trial'
}

export type PlatformDeploymentRequest = {
  __typename?: 'PlatformDeploymentRequest';
  activity_sector: Maybe<DeploymentRequestActivitySector>;
  actual_state: Maybe<DeploymentRequestPlatformState>;
  end_date: Maybe<Scalars['Date']['output']>;
  failure_reason: Maybe<Scalars['String']['output']>;
  hub_status: DeploymentRequestHubStatus;
  id: Scalars['ID']['output'];
  job_title: Maybe<DeploymentRequestJobTitle>;
  ordering: Scalars['Int']['output'];
  organization_domains: Maybe<Array<Scalars['String']['output']>>;
  organization_name: Scalars['String']['output'];
  platform_id: Maybe<Scalars['String']['output']>;
  platform_identifier: PlatformIdentifier;
  platform_token: Scalars['String']['output'];
  platform_url: Maybe<Scalars['String']['output']>;
  region: DeploymentRequestPlatformRegion;
  requester_email: Scalars['String']['output'];
  requester_first_name: Maybe<Scalars['String']['output']>;
  requester_last_name: Maybe<Scalars['String']['output']>;
  start_date: Maybe<Scalars['Date']['output']>;
  target_state: Maybe<DeploymentRequestPlatformState>;
  type: DeploymentRequestDeploymentType;
  use_case: Maybe<DeploymentRequestUseCase>;
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
  tenantId: InputMaybe<Scalars['String']['input']>;
  tenantName: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
  version: InputMaybe<Scalars['String']['input']>;
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
  GenerateManifest = 'GENERATE_MANIFEST',
  ManageConnectorsIngestions = 'MANAGE_CONNECTORS_INGESTIONS',
  ManageDeployment = 'MANAGE_DEPLOYMENT',
  ManageManifestIngestions = 'MANAGE_MANIFEST_INGESTIONS',
  ModifyCompetitors = 'MODIFY_COMPETITORS',
  ModifyTrials = 'MODIFY_TRIALS',
  ModifyTrialsQuota = 'MODIFY_TRIALS_QUOTA',
  ReadTrials = 'READ_TRIALS'
}

export type ProvisionedNewsFeedItem = Node & {
  __typename?: 'ProvisionedNewsFeedItem';
  creation_date: Scalars['Date']['output'];
  id: Scalars['ID']['output'];
  is_deleted: Scalars['Boolean']['output'];
  metadata: Array<NewsFeedItemMetadata>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: NewsFeedItemType;
};

export type Query = {
  __typename?: 'Query';
  canUnregisterPlatform: CanUnregisterResponse;
  competitors: CompetitorConnection;
  countEpicsPerTimeline: Array<EpicCountPerTimeline>;
  deploymentRequests: PlatformDeploymentRequestConnection;
  deploymentRequestsAvailable: Array<DeploymentAvailability>;
  deploymentRequestsList: DeploymentRequestConnection;
  document: Maybe<Document>;
  documentExists: Maybe<Scalars['Boolean']['output']>;
  documents: DocumentConnection;
  epics: Maybe<EpicConnection>;
  isPlatformRegistered: IsPlatformRegisteredResponse;
  lastDeployedOverview: LastDeployedOverview;
  me: Maybe<User>;
  mostDeployedDocuments: Array<Document>;
  newestDocuments: Array<Document>;
  newsFeedItems: NewsFeedItemConnection;
  node: Maybe<Node>;
  /** @deprecated Use `refreshPlatformRegistrationConnectivityStatus` instead. This field is no longer used in the OpenCTI platform due to refactoring and the addition of a version value in the endpoint. */
  openCTIPlatformRegistrationStatus: OpenCtiPlatformRegistrationStatusResponse;
  organization: Maybe<Organization>;
  organizations: OrganizationConnection;
  pendingUsers: UserConnection;
  platformAssociatedOrganization: Maybe<Organization>;
  publicDocumentBySlug: Maybe<Document>;
  publicDocuments: DocumentConnection;
  publicDocumentsByServiceSlug: Array<Document>;
  registeredPlatform: Maybe<RegisteredPlatform>;
  registeredPlatforms: Array<RegisteredPlatform>;
  seoServiceInstance: SeoServiceInstance;
  seoServiceInstances: Array<SeoServiceInstance>;
  serviceGroups: Array<ServiceGroup>;
  serviceInstanceById: Maybe<ServiceInstance>;
  serviceInstanceByIdAndGrantAccess: Maybe<ServiceInstance>;
  serviceInstanceLinksByTags: Array<SeoServiceInstance>;
  serviceInstances: ServiceConnection;
  settings: Settings;
  subscriptionById: Maybe<SubscriptionModel>;
  subscriptions: SubscriptionConnection;
  trialDeployments: TrialsDeployments;
  updateOpenCTIManifest: Success;
  useCases: Maybe<UseCaseConnection>;
  userHasOrganizationWithSubscription: Scalars['Boolean']['output'];
  userOrganizations: Array<Organization>;
  userServiceFromSubscription: Maybe<UserServiceConnection>;
  users: UserConnection;
  usersWithCapabilitiesInOrganization: Array<User>;
};


export type QueryCanUnregisterPlatformArgs = {
  input: CanUnregisterPlatformInput;
};


export type QueryCompetitorsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: CompetitorOrdering;
  orderMode: OrderingMode;
};


export type QueryDeploymentRequestsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<DeploymentRequestFilter>>;
  first: Scalars['Int']['input'];
};


export type QueryDeploymentRequestsAvailableArgs = {
  platformIdentifier: PlatformIdentifier;
};


export type QueryDeploymentRequestsListArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<DeploymentRequestFilter>>;
  first: Scalars['Int']['input'];
  orderBy: DeploymentRequestOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryDocumentArgs = {
  documentId: Scalars['DocumentId']['input'];
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};


export type QueryDocumentExistsArgs = {
  documentName: InputMaybe<Scalars['String']['input']>;
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type QueryDocumentsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  logicalFilters: InputMaybe<LogicalFilterInput>;
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  parentsOnly: InputMaybe<Scalars['Boolean']['input']>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};


export type QueryEpicsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: EpicOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryIsPlatformRegisteredArgs = {
  input: IsPlatformRegisteredInput;
};


export type QueryLastDeployedOverviewArgs = {
  limit: Scalars['Int']['input'];
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};


export type QueryMostDeployedDocumentsArgs = {
  limit: Scalars['Int']['input'];
  platformIdentifiers: InputMaybe<Array<PlatformIdentifier>>;
};


export type QueryNewestDocumentsArgs = {
  limit: Scalars['Int']['input'];
  platformIdentifiers: InputMaybe<Array<PlatformIdentifier>>;
};


export type QueryNewsFeedItemsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
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
  after: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy: OrganizationOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryPendingUsersArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformAssociatedOrganizationArgs = {
  platformId: Scalars['String']['input'];
  tenantId: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublicDocumentBySlugArgs = {
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
  slug: Scalars['String']['input'];
};


export type QueryPublicDocumentsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  logicalFilters: InputMaybe<LogicalFilterInput>;
  orderBy: DocumentOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
  slug: Scalars['String']['input'];
};


export type QueryPublicDocumentsByServiceSlugArgs = {
  serviceInstanceSlug: Scalars['String']['input'];
};


export type QueryRegisteredPlatformArgs = {
  input: RegisteredPlatformInput;
};


export type QueryRegisteredPlatformsArgs = {
  input: RegisteredPlatformsInput;
};


export type QuerySeoServiceInstanceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryServiceGroupsArgs = {
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};


export type QueryServiceInstanceByIdArgs = {
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type QueryServiceInstanceByIdAndGrantAccessArgs = {
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};


export type QueryServiceInstanceLinksByTagsArgs = {
  tags: Array<ServiceInstanceTag>;
};


export type QueryServiceInstancesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<ServiceInstanceFilter>>;
  first: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubscriptionByIdArgs = {
  subscription_id: InputMaybe<Scalars['SubscriptionId']['input']>;
};


export type QuerySubscriptionsArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<SubscriptionFilter>>;
  first: Scalars['Int']['input'];
  orderBy: SubscriptionOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrialDeploymentsArgs = {
  input: TrialDeploymentsInput;
};


export type QueryUpdateOpenCtiManifestArgs = {
  tag: Scalars['String']['input'];
};


export type QueryUseCasesArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  documentType: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UseCaseOrdering;
  orderMode: OrderingMode;
  product: InputMaybe<FiligranProduct>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserServiceFromSubscriptionArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
  orderBy: UserServiceOrdering;
  orderMode: OrderingMode;
  subscription_id: Scalars['SubscriptionId']['input'];
};


export type QueryUsersArgs = {
  after: InputMaybe<Scalars['ID']['input']>;
  filters: InputMaybe<Array<Filter>>;
  first: Scalars['Int']['input'];
  orderBy: UserOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersWithCapabilitiesInOrganizationArgs = {
  input: UsersWithCapabilitiesInOrganizationInput;
};

export type RefreshPlatformRegistrationConnectivityStatusAllTenantsInput = {
  platformId: Scalars['String']['input'];
  platformIdentifier: PlatformIdentifier;
  platformVersion: Scalars['String']['input'];
  tenants: Array<TenantDetails>;
};

export type RefreshPlatformRegistrationConnectivityStatusAllTenantsResponse = {
  __typename?: 'RefreshPlatformRegistrationConnectivityStatusAllTenantsResponse';
  statuses: Array<TenantStatus>;
};

export type RefreshPlatformRegistrationConnectivityStatusInput = {
  platformId: Scalars['String']['input'];
  platformIdentifier: InputMaybe<PlatformIdentifier>;
  platformVersion: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type RefreshPlatformRegistrationConnectivityStatusResponse = {
  __typename?: 'RefreshPlatformRegistrationConnectivityStatusResponse';
  status: PlatformRegistrationConnectivityStatus;
};

export type RefreshPlatformRegistrationConnectivityStatusSingleTenantInput = {
  platformId: Scalars['String']['input'];
  platformIdentifier: PlatformIdentifier;
  platformVersion: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  token: Scalars['String']['input'];
  url: Scalars['String']['input'];
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
  deployment_request: Maybe<DeploymentRequest>;
  id: Scalars['ID']['output'];
  identifier: ServiceDefinitionIdentifier;
  illustration_document_id: Maybe<Scalars['DocumentId']['output']>;
  last_connectivity_check: Maybe<Scalars['Date']['output']>;
  myGroups: Maybe<Array<ServiceGroup>>;
  platform_id: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  tenant_id: Maybe<Scalars['String']['output']>;
  tenant_name: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
  version: Maybe<Scalars['String']['output']>;
};

export type RegisteredPlatformInput = {
  service_instance_id: Scalars['ServiceInstanceId']['input'];
};

export type RegisteredPlatformsInput = {
  hasDeployedResources: InputMaybe<Scalars['Boolean']['input']>;
  identifier: InputMaybe<PlatformIdentifier>;
  onlyActive: InputMaybe<Scalars['Boolean']['input']>;
  onlyTrial: InputMaybe<Scalars['Boolean']['input']>;
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
  id: Scalars['DeploymentRequestId']['input'];
};

export type RolePortal = Node & {
  __typename?: 'RolePortal';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type RssFeed = Document & Integration & Node & {
  __typename?: 'RssFeed';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  feed_url: Maybe<Scalars['String']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type SendTelemetryMutation = {
  __typename?: 'SendTelemetryMutation';
  oneClickDeploy: Maybe<TelemetryResponse>;
};


export type SendTelemetryMutationOneClickDeployArgs = {
  input: OneClickDeployInput;
};

export type SeoServiceInstance = Node & {
  __typename?: 'SeoServiceInstance';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  illustration_document_id: Maybe<Scalars['DocumentId']['output']>;
  links: Maybe<Array<Maybe<ServiceLink>>>;
  logo_document_id: Maybe<Scalars['DocumentId']['output']>;
  name: Scalars['String']['output'];
  service_definition: ServiceDefinition;
  slug: Maybe<Scalars['String']['output']>;
  tags: Maybe<Array<ServiceInstanceTag>>;
};

export type ServiceCapability = Node & {
  __typename?: 'ServiceCapability';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  service_definition_id: Maybe<Scalars['ID']['output']>;
};

export type ServiceConnection = {
  __typename?: 'ServiceConnection';
  edges: Array<ServiceInstanceEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ServiceDefinition = Node & {
  __typename?: 'ServiceDefinition';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  identifier: ServiceDefinitionIdentifier;
  name: Scalars['String']['output'];
  public: Maybe<Scalars['Boolean']['output']>;
  service_capability: Maybe<Array<Maybe<ServiceCapability>>>;
};

export enum ServiceDefinitionIdentifier {
  Link = 'link',
  OpenaevRegistration = 'openaev_registration',
  OpenaevScenarios = 'openaev_scenarios',
  OpenctiCustomDashboards = 'opencti_custom_dashboards',
  OpenctiCustomViews = 'opencti_custom_views',
  OpenctiIntegrations = 'opencti_integrations',
  OpenctiPlaybooks = 'opencti_playbooks',
  OpenctiRegistration = 'opencti_registration',
  Vault = 'vault',
  XtmPlatformRoadmap = 'xtm_platform_roadmap'
}

export type ServiceGroup = Node & {
  __typename?: 'ServiceGroup';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  users: Maybe<Array<User>>;
};

export type ServiceInstance = Node & {
  __typename?: 'ServiceInstance';
  capabilities: Array<Maybe<Scalars['String']['output']>>;
  creation_status: Maybe<ServiceInstanceCreationStatus>;
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  illustration_document_id: Maybe<Scalars['DocumentId']['output']>;
  links: Maybe<Array<Maybe<ServiceLink>>>;
  logo_document_id: Maybe<Scalars['DocumentId']['output']>;
  name: Scalars['String']['output'];
  ordering: Scalars['Int']['output'];
  organization: Maybe<Array<Maybe<Organization>>>;
  organization_subscribed: Maybe<Scalars['Boolean']['output']>;
  public: Maybe<Scalars['Boolean']['output']>;
  service_definition: Maybe<ServiceDefinition>;
  slug: Maybe<Scalars['String']['output']>;
  subscriptions: Maybe<Array<Maybe<SubscriptionModel>>>;
  tags: Maybe<Array<ServiceInstanceTag>>;
  user_joined: Maybe<Scalars['Boolean']['output']>;
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
  node: Maybe<ServiceInstance>;
};

export type ServiceInstanceFilter = {
  key: InputMaybe<ServiceInstanceFilterKey>;
  value: Array<Scalars['String']['input']>;
};

export enum ServiceInstanceFilterKey {
  Id = 'id',
  Public = 'public',
  ServiceDefinitionIdentifier = 'service_definition_identifier',
  Tags = 'tags'
}

export enum ServiceInstanceOrdering {
  Description = 'description',
  Name = 'name',
  Ordering = 'ordering'
}

export type ServiceInstanceSubscription = {
  __typename?: 'ServiceInstanceSubscription';
  add: Maybe<ServiceInstance>;
  delete: Maybe<ServiceInstance>;
  edit: Maybe<ServiceInstance>;
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
  name: Maybe<Scalars['String']['output']>;
  service_instance_id: Maybe<Scalars['ID']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export enum ServiceRestriction {
  Access = 'ACCESS',
  AccessUser = 'ACCESS_USER',
  Delete = 'DELETE',
  ManageAccess = 'MANAGE_ACCESS',
  Upload = 'UPLOAD',
  Upsert = 'UPSERT'
}

export type Settings = {
  __typename?: 'Settings';
  base_url_front: Scalars['String']['output'];
  environment: Scalars['String']['output'];
  platform_feature_flags: Array<FeatureFlag>;
  platform_providers: Array<PlatformProvider>;
};

export type ShareableResource = {
  __typename?: 'ShareableResource';
  active: Scalars['Boolean']['output'];
  created_at: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image_type: Maybe<DocumentImageType>;
  name: Maybe<Scalars['String']['output']>;
  source_type: DocumentSourceType;
};

export type Stream = Document & Integration & Node & {
  __typename?: 'Stream';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  feed_url: Maybe<Scalars['String']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
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
  MeUser: Maybe<MeUserSubscription>;
  ServiceInstance: Maybe<ServiceInstanceSubscription>;
  User: Maybe<UserSubscription>;
  UserPending: Maybe<UserPendingSubscription>;
};


export type SubscriptionUserArgs = {
  organizationId: InputMaybe<Scalars['ID']['input']>;
};


export type SubscriptionUserPendingArgs = {
  organizationId: Scalars['ID']['input'];
};

export type SubscriptionCapability = Node & {
  __typename?: 'SubscriptionCapability';
  id: Scalars['ID']['output'];
  service_capability: Maybe<ServiceCapability>;
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
  node: SubscriptionModel;
};

export type SubscriptionFilter = {
  key: SubscriptionFilterKey;
  value: Array<Scalars['String']['input']>;
};

export enum SubscriptionFilterKey {
  OrganizationId = 'organization_id',
  OrganizationName = 'organization_name',
  ServiceInstanceId = 'service_instance_id'
}

export type SubscriptionModel = Node & {
  __typename?: 'SubscriptionModel';
  end_date: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  organization: Organization;
  organization_id: Scalars['OrganizationId']['output'];
  service_instance: ServiceInstance;
  service_instance_id: Scalars['ServiceInstanceId']['output'];
  service_url: Scalars['String']['output'];
  start_date: Maybe<Scalars['Date']['output']>;
  subscription_capability: Maybe<Array<Maybe<SubscriptionCapability>>>;
  user_service: Array<Maybe<UserService>>;
};

export enum SubscriptionOrdering {
  EndDate = 'end_date',
  OrganizationName = 'organization_name',
  ServiceDescription = 'service_description',
  ServiceName = 'service_name',
  ServiceProvider = 'service_provider',
  ServiceType = 'service_type',
  StartDate = 'start_date'
}

export type Success = {
  __typename?: 'Success';
  success: Scalars['Boolean']['output'];
};

export type TaxiiFeed = Document & Integration & Node & {
  __typename?: 'TaxiiFeed';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  feed_url: Maybe<Scalars['String']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
};

export type TelemetryResponse = {
  __typename?: 'TelemetryResponse';
  message: Maybe<Scalars['String']['output']>;
  result: Scalars['Boolean']['output'];
};

export type TenantDetails = {
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  token: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type TenantStatus = {
  __typename?: 'TenantStatus';
  status: PlatformRegistrationConnectivityStatus;
  tenantId: Scalars['String']['output'];
};

export type ThirdPartyIntegration = Document & Integration & Node & {
  __typename?: 'ThirdPartyIntegration';
  active: Scalars['Boolean']['output'];
  blogpost_url: Maybe<Scalars['String']['output']>;
  children_documents: Maybe<Array<ShareableResource>>;
  created_at: Scalars['Date']['output'];
  datasheet_url: Maybe<Scalars['String']['output']>;
  demo_url: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  download_number: Maybe<Scalars['Int']['output']>;
  file_name: Maybe<Scalars['String']['output']>;
  github_url: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  integration_subtype: IntegrationSubType;
  integration_type: IntegrationType;
  name: Scalars['String']['output'];
  product_version: Maybe<Scalars['String']['output']>;
  remover_id: Maybe<Scalars['ID']['output']>;
  service_instance: Maybe<ServiceInstance>;
  service_instance_id: Maybe<Scalars['ServiceInstanceId']['output']>;
  share_number: Maybe<Scalars['Int']['output']>;
  short_description: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  subscription: Maybe<SubscriptionModel>;
  type: Scalars['String']['output'];
  updated_at: Maybe<Scalars['Date']['output']>;
  updater_id: Maybe<Scalars['String']['output']>;
  uploader: Maybe<User>;
  uploader_organization: Maybe<Organization>;
  use_cases: Maybe<Array<UseCase>>;
  vendor_url: Scalars['String']['output'];
};

export enum Timeline {
  Finished = 'finished',
  Next = 'next',
  Now = 'now',
  UnderConsideration = 'under_consideration'
}

export type TrialDeploymentsInput = {
  organizationId: Scalars['OrganizationId']['input'];
  platformIdentifiers: InputMaybe<Array<PlatformIdentifier>>;
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
  tenantId: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCompetitorInput = {
  domain: InputMaybe<Scalars['String']['input']>;
  id: Scalars['CompetitorId']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  tier: InputMaybe<CompetitorTier>;
};

export type UpdateDeploymentQuotaCapacityInput = {
  newCapacity: Scalars['Int']['input'];
  platformIdentifier: PlatformIdentifier;
  region: DeploymentRequestPlatformRegion;
};

export type UpdateDeploymentRequestInput = {
  actual_state: InputMaybe<DeploymentRequestPlatformState>;
  end_date: InputMaybe<Scalars['Date']['input']>;
  failure_reason: InputMaybe<Scalars['String']['input']>;
  id: Scalars['DeploymentRequestId']['input'];
  ordering: InputMaybe<Scalars['Int']['input']>;
  platform_id: InputMaybe<Scalars['String']['input']>;
  start_date: InputMaybe<Scalars['Date']['input']>;
};

export type UpdateDocumentInput = {
  active: InputMaybe<Scalars['Boolean']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  entity_types: InputMaybe<Array<Scalars['String']['input']>>;
  name: InputMaybe<Scalars['String']['input']>;
  short_description: InputMaybe<Scalars['String']['input']>;
  uploader_id: InputMaybe<Scalars['UserId']['input']>;
  uploader_organization_id: InputMaybe<Scalars['OrganizationId']['input']>;
  use_cases: InputMaybe<Array<Scalars['UseCaseId']['input']>>;
};

export type UpdateEpicInput = {
  active: InputMaybe<Scalars['Boolean']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  edition_type: EditionType;
  illustration_document: InputMaybe<Scalars['Upload']['input']>;
  is_integration: InputMaybe<Scalars['Boolean']['input']>;
  product: InputMaybe<FiligranProduct>;
  short_description: InputMaybe<Scalars['String']['input']>;
  timeline: InputMaybe<Timeline>;
  title: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlatformServiceMetadataInput = {
  name: InputMaybe<Scalars['String']['input']>;
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
};

export type UpdateServiceGroupsInput = {
  groups: Array<UpdateServiceGroupsInputGroup>;
};

export type UpdateServiceGroupsInputGroup = {
  id: Scalars['ServiceGroupId']['input'];
  userIds: Array<Scalars['UserId']['input']>;
};

export type UpdateSubscriptionInput = {
  capability_ids: InputMaybe<Array<Scalars['Service_CapabilityId']['input']>>;
  end_date: InputMaybe<Scalars['Date']['input']>;
  start_date: InputMaybe<Scalars['Date']['input']>;
};

export type UseCase = Node & {
  __typename?: 'UseCase';
  color: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  product: Array<FiligranProduct>;
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
  capabilities: Maybe<Array<Capability>>;
  country: Maybe<Scalars['String']['output']>;
  disabled: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  first_name: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  last_login: Maybe<Scalars['Date']['output']>;
  last_name: Maybe<Scalars['String']['output']>;
  organization_capabilities: Maybe<Array<OrganizationCapabilities>>;
  organizations: Maybe<Array<Organization>>;
  pending_organization_id: Maybe<Scalars['OrganizationId']['output']>;
  picture: Maybe<Scalars['String']['output']>;
  roles_portal: Maybe<Array<RolePortal>>;
  selected_language: Maybe<Scalars['String']['output']>;
  selected_org_capabilities: Maybe<Array<OrganizationCapability>>;
  selected_organization_id: Maybe<Scalars['OrganizationId']['output']>;
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
  delete: Maybe<User>;
  invalidate: Maybe<OrganizationRef>;
};

export type UserService = Node & {
  __typename?: 'UserService';
  id: Scalars['ID']['output'];
  ordering: Maybe<Scalars['Int']['output']>;
  subscription: Maybe<SubscriptionModel>;
  subscription_id: Scalars['ID']['output'];
  user: Maybe<User>;
  user_id: Scalars['ID']['output'];
  user_service_capability: Maybe<Array<Maybe<UserServiceCapability>>>;
};

export type UserServiceAddInput = {
  capabilities: InputMaybe<Array<Scalars['String']['input']>>;
  email: Array<Scalars['String']['input']>;
  subscription_id: Scalars['SubscriptionId']['input'];
};

export type UserServiceAddYourselfInput = {
  email: Array<Scalars['String']['input']>;
  serviceInstanceId: InputMaybe<Scalars['ServiceInstanceId']['input']>;
};

export type UserServiceCapability = Node & {
  __typename?: 'UserServiceCapability';
  generic_service_capability: Maybe<GenericServiceCapability>;
  id: Scalars['ID']['output'];
  subscription_capability: Maybe<SubscriptionCapability>;
  user_service_id: Scalars['ID']['output'];
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
  node: Maybe<UserService>;
};

export type UserServiceEditInput = {
  capabilities: Array<Scalars['String']['input']>;
  userServiceId: Scalars['User_ServiceId']['input'];
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

export type UserServicesAddCapabilitiesInput = {
  capabilities: Array<Scalars['String']['input']>;
  userServiceIds: Array<Scalars['User_ServiceId']['input']>;
};

export type UserServicesDeleteInput = {
  userServiceIds: Array<Scalars['User_ServiceId']['input']>;
};

export type UserSubscription = {
  __typename?: 'UserSubscription';
  add: Maybe<User>;
  delete: Maybe<User>;
  edit: Maybe<User>;
  merge: Maybe<MergeEvent>;
};

export type UsersWithCapabilitiesInOrganizationInput = {
  capabilities: Array<OrganizationCapability>;
  organizationId: Scalars['OrganizationId']['input'];
};

type HomepageDocument_Connector_Fragment = { __typename?: 'Connector', verified: boolean, manager_supported: boolean, id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_CsvFeed_Fragment = { __typename?: 'CsvFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_CustomDashboard_Fragment = { __typename?: 'CustomDashboard', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_CustomView_Fragment = { __typename?: 'CustomView', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_DefaultDocument_Fragment = { __typename?: 'DefaultDocument', id: string, name: string | null, short_description: string | null, type: string, active: boolean, slug: string | null, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_IntegrationHack_Fragment = { __typename?: 'IntegrationHack', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_OpenAevScenario_Fragment = { __typename?: 'OpenAEVScenario', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_OpenCtiPlaybook_Fragment = { __typename?: 'OpenCTIPlaybook', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_RssFeed_Fragment = { __typename?: 'RssFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_Stream_Fragment = { __typename?: 'Stream', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_TaxiiFeed_Fragment = { __typename?: 'TaxiiFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

type HomepageDocument_ThirdPartyIntegration_Fragment = { __typename?: 'ThirdPartyIntegration', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null };

export type HomepageDocumentFragment = HomepageDocument_Connector_Fragment | HomepageDocument_CsvFeed_Fragment | HomepageDocument_CustomDashboard_Fragment | HomepageDocument_CustomView_Fragment | HomepageDocument_DefaultDocument_Fragment | HomepageDocument_IntegrationHack_Fragment | HomepageDocument_OpenAevScenario_Fragment | HomepageDocument_OpenCtiPlaybook_Fragment | HomepageDocument_RssFeed_Fragment | HomepageDocument_Stream_Fragment | HomepageDocument_TaxiiFeed_Fragment | HomepageDocument_ThirdPartyIntegration_Fragment;

export type MostDeployedDocumentsQueryQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  platformIdentifiers: InputMaybe<Array<PlatformIdentifier> | PlatformIdentifier>;
}>;


export type MostDeployedDocumentsQueryQuery = { __typename?: 'Query', mostDeployedDocuments: Array<{ __typename?: 'Connector', verified: boolean, manager_supported: boolean, id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CsvFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomDashboard', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomView', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'DefaultDocument', id: string, name: string | null, short_description: string | null, type: string, active: boolean, slug: string | null, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'IntegrationHack', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenAEVScenario', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenCTIPlaybook', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'RssFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'Stream', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'TaxiiFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'ThirdPartyIntegration', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null }> };

export type NewestDocumentsQueryQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  platformIdentifiers: InputMaybe<Array<PlatformIdentifier> | PlatformIdentifier>;
}>;


export type NewestDocumentsQueryQuery = { __typename?: 'Query', newestDocuments: Array<{ __typename?: 'Connector', verified: boolean, manager_supported: boolean, id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CsvFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomDashboard', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomView', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'DefaultDocument', id: string, name: string | null, short_description: string | null, type: string, active: boolean, slug: string | null, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'IntegrationHack', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenAEVScenario', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenCTIPlaybook', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'RssFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'Stream', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'TaxiiFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'ThirdPartyIntegration', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null }> };

export type LastDeployedOverviewQueryQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  serviceInstanceId: Scalars['ServiceInstanceId']['input'];
}>;


export type LastDeployedOverviewQueryQuery = { __typename?: 'Query', lastDeployedOverview: { __typename?: 'LastDeployedOverview', resources: Array<{ __typename?: 'DeployedResource', deployedAt: any, document: { __typename?: 'Connector', verified: boolean, manager_supported: boolean, id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CsvFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomDashboard', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'CustomView', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'DefaultDocument', id: string, name: string | null, short_description: string | null, type: string, active: boolean, slug: string | null, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'IntegrationHack', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenAEVScenario', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'OpenCTIPlaybook', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'RssFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'Stream', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'TaxiiFeed', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null } | { __typename?: 'ThirdPartyIntegration', id: string, name: string, short_description: string | null, type: string, active: boolean, slug: string, service_instance_id: any | null, children_documents: Array<{ __typename?: 'ShareableResource', id: string, image_type: DocumentImageType | null }> | null, use_cases: Array<{ __typename?: 'UseCase', id: string, name: string }> | null }, deployedBy: { __typename?: 'User', id: string, first_name: string | null, last_name: string | null, email: string, picture: string | null } | null }> } };

export type MeCheckQueryVariables = Exact<{ [key: string]: never; }>;


export type MeCheckQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string } | null };

export type OrganizationSubscribedServicesBreadcrumbQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrganizationSubscribedServicesBreadcrumbQuery = { __typename?: 'Query', organization: { __typename?: 'Organization', id: string, name: string } | null };

export type OrganizationSubscribedServiceRowFragment = { __typename?: 'SubscriptionModel', id: string, start_date: any | null, service_instance: { __typename?: 'ServiceInstance', id: string, name: string, creation_status: ServiceInstanceCreationStatus | null, tags: Array<ServiceInstanceTag> | null, service_definition: { __typename?: 'ServiceDefinition', id: string, name: string, identifier: ServiceDefinitionIdentifier } | null } };

export type OrganizationSubscribedServicesListQueryVariables = Exact<{
  count: Scalars['Int']['input'];
  after: InputMaybe<Scalars['ID']['input']>;
  orderBy: SubscriptionOrdering;
  orderMode: OrderingMode;
  searchTerm: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<Array<SubscriptionFilter> | SubscriptionFilter>;
}>;


export type OrganizationSubscribedServicesListQuery = { __typename?: 'Query', subscriptions: { __typename?: 'SubscriptionConnection', totalCount: number, edges: Array<{ __typename?: 'SubscriptionEdge', node: { __typename?: 'SubscriptionModel', id: string, start_date: any | null, service_instance: { __typename?: 'ServiceInstance', id: string, name: string, creation_status: ServiceInstanceCreationStatus | null, tags: Array<ServiceInstanceTag> | null, service_definition: { __typename?: 'ServiceDefinition', id: string, name: string, identifier: ServiceDefinitionIdentifier } | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type RegisteredPlatformsListQueryVariables = Exact<{
  input: RegisteredPlatformsInput;
}>;


export type RegisteredPlatformsListQuery = { __typename?: 'Query', registeredPlatforms: Array<{ __typename?: 'RegisteredPlatform', id: string, platform_id: string, title: string, url: string, contract: PlatformContract, identifier: ServiceDefinitionIdentifier, subscription: { __typename?: 'SubscriptionModel', end_date: any | null, start_date: any | null, service_instance: { __typename?: 'ServiceInstance', id: string, name: string } } | null }> };

export type RegisteredPlatformsQueryVariables = Exact<{
  input: RegisteredPlatformsInput;
}>;


export type RegisteredPlatformsQuery = { __typename?: 'Query', registeredPlatforms: Array<{ __typename?: 'RegisteredPlatform', id: string, identifier: ServiceDefinitionIdentifier, title: string, contract: PlatformContract, subscription: { __typename?: 'SubscriptionModel', start_date: any | null, end_date: any | null, service_instance_id: any } | null }> };

export type ServiceInstancesListQueryVariables = Exact<{
  count: Scalars['Int']['input'];
  orderBy: ServiceInstanceOrdering;
  orderMode: OrderingMode;
  filters: InputMaybe<Array<ServiceInstanceFilter> | ServiceInstanceFilter>;
  searchTerm: InputMaybe<Scalars['String']['input']>;
}>;


export type ServiceInstancesListQuery = { __typename?: 'Query', serviceInstances: { __typename?: 'ServiceConnection', edges: Array<{ __typename?: 'ServiceInstanceEdge', node: { __typename?: 'ServiceInstance', id: string, name: string, service_definition: { __typename?: 'ServiceDefinition', identifier: ServiceDefinitionIdentifier } | null } | null }> } };

export type TrialDeploymentsEligibilityQueryVariables = Exact<{
  input: TrialDeploymentsInput;
}>;


export type TrialDeploymentsEligibilityQuery = { __typename?: 'Query', trialDeployments: { __typename?: 'TrialsDeployments', availableTrials: Array<PlatformIdentifier>, isBlacklisted: boolean } };

export type UseCaseAddMutationVariables = Exact<{
  input: AddUseCaseInput;
}>;


export type UseCaseAddMutation = { __typename?: 'Mutation', addUseCase: { __typename?: 'UseCase', id: string, name: string, color: string, product: Array<FiligranProduct> } };

export type UseCaseEditMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: EditUseCaseInput;
}>;


export type UseCaseEditMutation = { __typename?: 'Mutation', editUseCase: { __typename?: 'UseCase', id: string, name: string, color: string, product: Array<FiligranProduct> } };

export type UseCaseDeleteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UseCaseDeleteMutation = { __typename?: 'Mutation', deleteUseCase: { __typename?: 'UseCase', id: string } };

export type UseCaseRowFragment = { __typename?: 'UseCase', id: string, name: string, color: string, product: Array<FiligranProduct> };

export type UseCasesListQueryVariables = Exact<{
  count: Scalars['Int']['input'];
  orderBy: UseCaseOrdering;
  orderMode: OrderingMode;
  documentType: InputMaybe<Scalars['String']['input']>;
  product: InputMaybe<FiligranProduct>;
}>;


export type UseCasesListQuery = { __typename?: 'Query', useCases: { __typename?: 'UseCaseConnection', totalCount: number, edges: Array<{ __typename?: 'UseCaseEdge', node: { __typename?: 'UseCase', id: string, name: string, color: string, product: Array<FiligranProduct> } }> } | null };

export type EpicCountPerTimelineQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type EpicCountPerTimelineQueryQuery = { __typename?: 'Query', countEpicsPerTimeline: Array<{ __typename?: 'EpicCountPerTimeline', timeline: Timeline, count: number }> };


export const HomepageDocumentFragmentDoc = `
    fragment HomepageDocument on Document {
  id
  name
  short_description
  type
  active
  slug
  service_instance_id
  children_documents {
    id
    image_type
  }
  use_cases {
    id
    name
  }
  ... on Connector {
    verified
    manager_supported
  }
}
    `;
export const OrganizationSubscribedServiceRowFragmentDoc = `
    fragment OrganizationSubscribedServiceRow on SubscriptionModel {
  id
  start_date
  service_instance {
    id
    name
    creation_status
    tags
    service_definition {
      id
      name
      identifier
    }
  }
}
    `;
export const UseCaseRowFragmentDoc = `
    fragment UseCaseRow on UseCase {
  id
  name
  color
  product
}
    `;
export const MostDeployedDocumentsQueryDocument = `
    query MostDeployedDocumentsQuery($limit: Int!, $platformIdentifiers: [PlatformIdentifier!]) {
  mostDeployedDocuments(limit: $limit, platformIdentifiers: $platformIdentifiers) {
    ...HomepageDocument
  }
}
    ${HomepageDocumentFragmentDoc}`;

export const useMostDeployedDocumentsQueryQuery = <
      TData = MostDeployedDocumentsQueryQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: MostDeployedDocumentsQueryQueryVariables,
      options?: Omit<UseQueryOptions<MostDeployedDocumentsQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<MostDeployedDocumentsQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<MostDeployedDocumentsQueryQuery, TError, TData>(
      {
    queryKey: ['MostDeployedDocumentsQuery', variables],
    queryFn: fetcher<MostDeployedDocumentsQueryQuery, MostDeployedDocumentsQueryQueryVariables>(client, MostDeployedDocumentsQueryDocument, variables, headers),
    ...options
  }
    )};

useMostDeployedDocumentsQueryQuery.getKey = (variables: MostDeployedDocumentsQueryQueryVariables) => ['MostDeployedDocumentsQuery', variables];
useMostDeployedDocumentsQueryQuery.getRootKey = () => ['MostDeployedDocumentsQuery'] as const;
export const useInfiniteMostDeployedDocumentsQueryQuery = <
      TData = InfiniteData<MostDeployedDocumentsQueryQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: MostDeployedDocumentsQueryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<MostDeployedDocumentsQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<MostDeployedDocumentsQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<MostDeployedDocumentsQueryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['MostDeployedDocumentsQuery.infinite', variables],
      queryFn: (metaData) => fetcher<MostDeployedDocumentsQueryQuery, MostDeployedDocumentsQueryQueryVariables>(client, MostDeployedDocumentsQueryDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteMostDeployedDocumentsQueryQuery.getKey = (variables: MostDeployedDocumentsQueryQueryVariables) => ['MostDeployedDocumentsQuery.infinite', variables];
useInfiniteMostDeployedDocumentsQueryQuery.getRootKey = () => ['MostDeployedDocumentsQuery.infinite'] as const;
useMostDeployedDocumentsQueryQuery.fetcher = (client: GraphQLClient, variables: MostDeployedDocumentsQueryQueryVariables, headers?: RequestInit['headers']) => fetcher<MostDeployedDocumentsQueryQuery, MostDeployedDocumentsQueryQueryVariables>(client, MostDeployedDocumentsQueryDocument, variables, headers);

export const NewestDocumentsQueryDocument = `
    query NewestDocumentsQuery($limit: Int!, $platformIdentifiers: [PlatformIdentifier!]) {
  newestDocuments(limit: $limit, platformIdentifiers: $platformIdentifiers) {
    ...HomepageDocument
  }
}
    ${HomepageDocumentFragmentDoc}`;

export const useNewestDocumentsQueryQuery = <
      TData = NewestDocumentsQueryQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: NewestDocumentsQueryQueryVariables,
      options?: Omit<UseQueryOptions<NewestDocumentsQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<NewestDocumentsQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<NewestDocumentsQueryQuery, TError, TData>(
      {
    queryKey: ['NewestDocumentsQuery', variables],
    queryFn: fetcher<NewestDocumentsQueryQuery, NewestDocumentsQueryQueryVariables>(client, NewestDocumentsQueryDocument, variables, headers),
    ...options
  }
    )};

useNewestDocumentsQueryQuery.getKey = (variables: NewestDocumentsQueryQueryVariables) => ['NewestDocumentsQuery', variables];
useNewestDocumentsQueryQuery.getRootKey = () => ['NewestDocumentsQuery'] as const;
export const useInfiniteNewestDocumentsQueryQuery = <
      TData = InfiniteData<NewestDocumentsQueryQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: NewestDocumentsQueryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<NewestDocumentsQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<NewestDocumentsQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<NewestDocumentsQueryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['NewestDocumentsQuery.infinite', variables],
      queryFn: (metaData) => fetcher<NewestDocumentsQueryQuery, NewestDocumentsQueryQueryVariables>(client, NewestDocumentsQueryDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteNewestDocumentsQueryQuery.getKey = (variables: NewestDocumentsQueryQueryVariables) => ['NewestDocumentsQuery.infinite', variables];
useInfiniteNewestDocumentsQueryQuery.getRootKey = () => ['NewestDocumentsQuery.infinite'] as const;
useNewestDocumentsQueryQuery.fetcher = (client: GraphQLClient, variables: NewestDocumentsQueryQueryVariables, headers?: RequestInit['headers']) => fetcher<NewestDocumentsQueryQuery, NewestDocumentsQueryQueryVariables>(client, NewestDocumentsQueryDocument, variables, headers);

export const LastDeployedOverviewQueryDocument = `
    query LastDeployedOverviewQuery($limit: Int!, $serviceInstanceId: ServiceInstanceId!) {
  lastDeployedOverview(limit: $limit, serviceInstanceId: $serviceInstanceId) {
    resources {
      document {
        ...HomepageDocument
      }
      deployedAt
      deployedBy {
        id
        first_name
        last_name
        email
        picture
      }
    }
  }
}
    ${HomepageDocumentFragmentDoc}`;

export const useLastDeployedOverviewQueryQuery = <
      TData = LastDeployedOverviewQueryQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: LastDeployedOverviewQueryQueryVariables,
      options?: Omit<UseQueryOptions<LastDeployedOverviewQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<LastDeployedOverviewQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<LastDeployedOverviewQueryQuery, TError, TData>(
      {
    queryKey: ['LastDeployedOverviewQuery', variables],
    queryFn: fetcher<LastDeployedOverviewQueryQuery, LastDeployedOverviewQueryQueryVariables>(client, LastDeployedOverviewQueryDocument, variables, headers),
    ...options
  }
    )};

useLastDeployedOverviewQueryQuery.getKey = (variables: LastDeployedOverviewQueryQueryVariables) => ['LastDeployedOverviewQuery', variables];
useLastDeployedOverviewQueryQuery.getRootKey = () => ['LastDeployedOverviewQuery'] as const;
export const useInfiniteLastDeployedOverviewQueryQuery = <
      TData = InfiniteData<LastDeployedOverviewQueryQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: LastDeployedOverviewQueryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<LastDeployedOverviewQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<LastDeployedOverviewQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<LastDeployedOverviewQueryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['LastDeployedOverviewQuery.infinite', variables],
      queryFn: (metaData) => fetcher<LastDeployedOverviewQueryQuery, LastDeployedOverviewQueryQueryVariables>(client, LastDeployedOverviewQueryDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteLastDeployedOverviewQueryQuery.getKey = (variables: LastDeployedOverviewQueryQueryVariables) => ['LastDeployedOverviewQuery.infinite', variables];
useInfiniteLastDeployedOverviewQueryQuery.getRootKey = () => ['LastDeployedOverviewQuery.infinite'] as const;
useLastDeployedOverviewQueryQuery.fetcher = (client: GraphQLClient, variables: LastDeployedOverviewQueryQueryVariables, headers?: RequestInit['headers']) => fetcher<LastDeployedOverviewQueryQuery, LastDeployedOverviewQueryQueryVariables>(client, LastDeployedOverviewQueryDocument, variables, headers);

export const MeCheckDocument = `
    query meCheck {
  me {
    id
  }
}
    `;

export const useMeCheckQuery = <
      TData = MeCheckQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: MeCheckQueryVariables,
      options?: Omit<UseQueryOptions<MeCheckQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<MeCheckQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<MeCheckQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['meCheck'] : ['meCheck', variables],
    queryFn: fetcher<MeCheckQuery, MeCheckQueryVariables>(client, MeCheckDocument, variables, headers),
    ...options
  }
    )};

useMeCheckQuery.getKey = (variables?: MeCheckQueryVariables) => variables === undefined ? ['meCheck'] : ['meCheck', variables];
useMeCheckQuery.getRootKey = () => ['meCheck'] as const;
export const useInfiniteMeCheckQuery = <
      TData = InfiniteData<MeCheckQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: MeCheckQueryVariables,
      options: Omit<UseInfiniteQueryOptions<MeCheckQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<MeCheckQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<MeCheckQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['meCheck.infinite'] : ['meCheck.infinite', variables],
      queryFn: (metaData) => fetcher<MeCheckQuery, MeCheckQueryVariables>(client, MeCheckDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteMeCheckQuery.getKey = (variables?: MeCheckQueryVariables) => variables === undefined ? ['meCheck.infinite'] : ['meCheck.infinite', variables];
useInfiniteMeCheckQuery.getRootKey = () => ['meCheck.infinite'] as const;
useMeCheckQuery.fetcher = (client: GraphQLClient, variables?: MeCheckQueryVariables, headers?: RequestInit['headers']) => fetcher<MeCheckQuery, MeCheckQueryVariables>(client, MeCheckDocument, variables, headers);

export const OrganizationSubscribedServicesBreadcrumbDocument = `
    query OrganizationSubscribedServicesBreadcrumb($id: ID!) {
  organization(id: $id) {
    id
    name
  }
}
    `;

export const useOrganizationSubscribedServicesBreadcrumbQuery = <
      TData = OrganizationSubscribedServicesBreadcrumbQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: OrganizationSubscribedServicesBreadcrumbQueryVariables,
      options?: Omit<UseQueryOptions<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>(
      {
    queryKey: ['OrganizationSubscribedServicesBreadcrumb', variables],
    queryFn: fetcher<OrganizationSubscribedServicesBreadcrumbQuery, OrganizationSubscribedServicesBreadcrumbQueryVariables>(client, OrganizationSubscribedServicesBreadcrumbDocument, variables, headers),
    ...options
  }
    )};

useOrganizationSubscribedServicesBreadcrumbQuery.getKey = (variables: OrganizationSubscribedServicesBreadcrumbQueryVariables) => ['OrganizationSubscribedServicesBreadcrumb', variables];
useOrganizationSubscribedServicesBreadcrumbQuery.getRootKey = () => ['OrganizationSubscribedServicesBreadcrumb'] as const;
export const useInfiniteOrganizationSubscribedServicesBreadcrumbQuery = <
      TData = InfiniteData<OrganizationSubscribedServicesBreadcrumbQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: OrganizationSubscribedServicesBreadcrumbQueryVariables,
      options: Omit<UseInfiniteQueryOptions<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<OrganizationSubscribedServicesBreadcrumbQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['OrganizationSubscribedServicesBreadcrumb.infinite', variables],
      queryFn: (metaData) => fetcher<OrganizationSubscribedServicesBreadcrumbQuery, OrganizationSubscribedServicesBreadcrumbQueryVariables>(client, OrganizationSubscribedServicesBreadcrumbDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteOrganizationSubscribedServicesBreadcrumbQuery.getKey = (variables: OrganizationSubscribedServicesBreadcrumbQueryVariables) => ['OrganizationSubscribedServicesBreadcrumb.infinite', variables];
useInfiniteOrganizationSubscribedServicesBreadcrumbQuery.getRootKey = () => ['OrganizationSubscribedServicesBreadcrumb.infinite'] as const;
useOrganizationSubscribedServicesBreadcrumbQuery.fetcher = (client: GraphQLClient, variables: OrganizationSubscribedServicesBreadcrumbQueryVariables, headers?: RequestInit['headers']) => fetcher<OrganizationSubscribedServicesBreadcrumbQuery, OrganizationSubscribedServicesBreadcrumbQueryVariables>(client, OrganizationSubscribedServicesBreadcrumbDocument, variables, headers);

export const OrganizationSubscribedServicesListDocument = `
    query OrganizationSubscribedServicesList($count: Int!, $after: ID, $orderBy: SubscriptionOrdering!, $orderMode: OrderingMode!, $searchTerm: String, $filters: [SubscriptionFilter!]) {
  subscriptions(
    first: $count
    after: $after
    orderBy: $orderBy
    orderMode: $orderMode
    searchTerm: $searchTerm
    filters: $filters
  ) {
    totalCount
    edges {
      node {
        ...OrganizationSubscribedServiceRow
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    ${OrganizationSubscribedServiceRowFragmentDoc}`;

export const useOrganizationSubscribedServicesListQuery = <
      TData = OrganizationSubscribedServicesListQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: OrganizationSubscribedServicesListQueryVariables,
      options?: Omit<UseQueryOptions<OrganizationSubscribedServicesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<OrganizationSubscribedServicesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<OrganizationSubscribedServicesListQuery, TError, TData>(
      {
    queryKey: ['OrganizationSubscribedServicesList', variables],
    queryFn: fetcher<OrganizationSubscribedServicesListQuery, OrganizationSubscribedServicesListQueryVariables>(client, OrganizationSubscribedServicesListDocument, variables, headers),
    ...options
  }
    )};

useOrganizationSubscribedServicesListQuery.getKey = (variables: OrganizationSubscribedServicesListQueryVariables) => ['OrganizationSubscribedServicesList', variables];
useOrganizationSubscribedServicesListQuery.getRootKey = () => ['OrganizationSubscribedServicesList'] as const;
export const useInfiniteOrganizationSubscribedServicesListQuery = <
      TData = InfiniteData<OrganizationSubscribedServicesListQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: OrganizationSubscribedServicesListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<OrganizationSubscribedServicesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<OrganizationSubscribedServicesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<OrganizationSubscribedServicesListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['OrganizationSubscribedServicesList.infinite', variables],
      queryFn: (metaData) => fetcher<OrganizationSubscribedServicesListQuery, OrganizationSubscribedServicesListQueryVariables>(client, OrganizationSubscribedServicesListDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteOrganizationSubscribedServicesListQuery.getKey = (variables: OrganizationSubscribedServicesListQueryVariables) => ['OrganizationSubscribedServicesList.infinite', variables];
useInfiniteOrganizationSubscribedServicesListQuery.getRootKey = () => ['OrganizationSubscribedServicesList.infinite'] as const;
useOrganizationSubscribedServicesListQuery.fetcher = (client: GraphQLClient, variables: OrganizationSubscribedServicesListQueryVariables, headers?: RequestInit['headers']) => fetcher<OrganizationSubscribedServicesListQuery, OrganizationSubscribedServicesListQueryVariables>(client, OrganizationSubscribedServicesListDocument, variables, headers);

export const RegisteredPlatformsListDocument = `
    query RegisteredPlatformsList($input: RegisteredPlatformsInput!) {
  registeredPlatforms(input: $input) {
    id
    platform_id
    title
    url
    contract
    identifier
    subscription {
      end_date
      start_date
      service_instance {
        id
        name
      }
    }
  }
}
    `;

export const useRegisteredPlatformsListQuery = <
      TData = RegisteredPlatformsListQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: RegisteredPlatformsListQueryVariables,
      options?: Omit<UseQueryOptions<RegisteredPlatformsListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<RegisteredPlatformsListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<RegisteredPlatformsListQuery, TError, TData>(
      {
    queryKey: ['RegisteredPlatformsList', variables],
    queryFn: fetcher<RegisteredPlatformsListQuery, RegisteredPlatformsListQueryVariables>(client, RegisteredPlatformsListDocument, variables, headers),
    ...options
  }
    )};

useRegisteredPlatformsListQuery.getKey = (variables: RegisteredPlatformsListQueryVariables) => ['RegisteredPlatformsList', variables];
useRegisteredPlatformsListQuery.getRootKey = () => ['RegisteredPlatformsList'] as const;
export const useInfiniteRegisteredPlatformsListQuery = <
      TData = InfiniteData<RegisteredPlatformsListQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: RegisteredPlatformsListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<RegisteredPlatformsListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<RegisteredPlatformsListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<RegisteredPlatformsListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['RegisteredPlatformsList.infinite', variables],
      queryFn: (metaData) => fetcher<RegisteredPlatformsListQuery, RegisteredPlatformsListQueryVariables>(client, RegisteredPlatformsListDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteRegisteredPlatformsListQuery.getKey = (variables: RegisteredPlatformsListQueryVariables) => ['RegisteredPlatformsList.infinite', variables];
useInfiniteRegisteredPlatformsListQuery.getRootKey = () => ['RegisteredPlatformsList.infinite'] as const;
useRegisteredPlatformsListQuery.fetcher = (client: GraphQLClient, variables: RegisteredPlatformsListQueryVariables, headers?: RequestInit['headers']) => fetcher<RegisteredPlatformsListQuery, RegisteredPlatformsListQueryVariables>(client, RegisteredPlatformsListDocument, variables, headers);

export const RegisteredPlatformsDocument = `
    query RegisteredPlatforms($input: RegisteredPlatformsInput!) {
  registeredPlatforms(input: $input) {
    id
    identifier
    title
    contract
    subscription {
      start_date
      end_date
      service_instance_id
    }
  }
}
    `;

export const useRegisteredPlatformsQuery = <
      TData = RegisteredPlatformsQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: RegisteredPlatformsQueryVariables,
      options?: Omit<UseQueryOptions<RegisteredPlatformsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<RegisteredPlatformsQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<RegisteredPlatformsQuery, TError, TData>(
      {
    queryKey: ['RegisteredPlatforms', variables],
    queryFn: fetcher<RegisteredPlatformsQuery, RegisteredPlatformsQueryVariables>(client, RegisteredPlatformsDocument, variables, headers),
    ...options
  }
    )};

useRegisteredPlatformsQuery.getKey = (variables: RegisteredPlatformsQueryVariables) => ['RegisteredPlatforms', variables];
useRegisteredPlatformsQuery.getRootKey = () => ['RegisteredPlatforms'] as const;
export const useInfiniteRegisteredPlatformsQuery = <
      TData = InfiniteData<RegisteredPlatformsQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: RegisteredPlatformsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<RegisteredPlatformsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<RegisteredPlatformsQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<RegisteredPlatformsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['RegisteredPlatforms.infinite', variables],
      queryFn: (metaData) => fetcher<RegisteredPlatformsQuery, RegisteredPlatformsQueryVariables>(client, RegisteredPlatformsDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteRegisteredPlatformsQuery.getKey = (variables: RegisteredPlatformsQueryVariables) => ['RegisteredPlatforms.infinite', variables];
useInfiniteRegisteredPlatformsQuery.getRootKey = () => ['RegisteredPlatforms.infinite'] as const;
useRegisteredPlatformsQuery.fetcher = (client: GraphQLClient, variables: RegisteredPlatformsQueryVariables, headers?: RequestInit['headers']) => fetcher<RegisteredPlatformsQuery, RegisteredPlatformsQueryVariables>(client, RegisteredPlatformsDocument, variables, headers);

export const ServiceInstancesListDocument = `
    query ServiceInstancesList($count: Int!, $orderBy: ServiceInstanceOrdering!, $orderMode: OrderingMode!, $filters: [ServiceInstanceFilter!], $searchTerm: String) {
  serviceInstances(
    first: $count
    orderBy: $orderBy
    orderMode: $orderMode
    filters: $filters
    searchTerm: $searchTerm
  ) {
    edges {
      node {
        id
        name
        service_definition {
          identifier
        }
      }
    }
  }
}
    `;

export const useServiceInstancesListQuery = <
      TData = ServiceInstancesListQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ServiceInstancesListQueryVariables,
      options?: Omit<UseQueryOptions<ServiceInstancesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ServiceInstancesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<ServiceInstancesListQuery, TError, TData>(
      {
    queryKey: ['ServiceInstancesList', variables],
    queryFn: fetcher<ServiceInstancesListQuery, ServiceInstancesListQueryVariables>(client, ServiceInstancesListDocument, variables, headers),
    ...options
  }
    )};

useServiceInstancesListQuery.getKey = (variables: ServiceInstancesListQueryVariables) => ['ServiceInstancesList', variables];
useServiceInstancesListQuery.getRootKey = () => ['ServiceInstancesList'] as const;
export const useInfiniteServiceInstancesListQuery = <
      TData = InfiniteData<ServiceInstancesListQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: ServiceInstancesListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<ServiceInstancesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<ServiceInstancesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<ServiceInstancesListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['ServiceInstancesList.infinite', variables],
      queryFn: (metaData) => fetcher<ServiceInstancesListQuery, ServiceInstancesListQueryVariables>(client, ServiceInstancesListDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteServiceInstancesListQuery.getKey = (variables: ServiceInstancesListQueryVariables) => ['ServiceInstancesList.infinite', variables];
useInfiniteServiceInstancesListQuery.getRootKey = () => ['ServiceInstancesList.infinite'] as const;
useServiceInstancesListQuery.fetcher = (client: GraphQLClient, variables: ServiceInstancesListQueryVariables, headers?: RequestInit['headers']) => fetcher<ServiceInstancesListQuery, ServiceInstancesListQueryVariables>(client, ServiceInstancesListDocument, variables, headers);

export const TrialDeploymentsEligibilityDocument = `
    query TrialDeploymentsEligibility($input: TrialDeploymentsInput!) {
  trialDeployments(input: $input) {
    availableTrials
    isBlacklisted
  }
}
    `;

export const useTrialDeploymentsEligibilityQuery = <
      TData = TrialDeploymentsEligibilityQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: TrialDeploymentsEligibilityQueryVariables,
      options?: Omit<UseQueryOptions<TrialDeploymentsEligibilityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TrialDeploymentsEligibilityQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<TrialDeploymentsEligibilityQuery, TError, TData>(
      {
    queryKey: ['TrialDeploymentsEligibility', variables],
    queryFn: fetcher<TrialDeploymentsEligibilityQuery, TrialDeploymentsEligibilityQueryVariables>(client, TrialDeploymentsEligibilityDocument, variables, headers),
    ...options
  }
    )};

useTrialDeploymentsEligibilityQuery.getKey = (variables: TrialDeploymentsEligibilityQueryVariables) => ['TrialDeploymentsEligibility', variables];
useTrialDeploymentsEligibilityQuery.getRootKey = () => ['TrialDeploymentsEligibility'] as const;
export const useInfiniteTrialDeploymentsEligibilityQuery = <
      TData = InfiniteData<TrialDeploymentsEligibilityQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: TrialDeploymentsEligibilityQueryVariables,
      options: Omit<UseInfiniteQueryOptions<TrialDeploymentsEligibilityQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<TrialDeploymentsEligibilityQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<TrialDeploymentsEligibilityQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['TrialDeploymentsEligibility.infinite', variables],
      queryFn: (metaData) => fetcher<TrialDeploymentsEligibilityQuery, TrialDeploymentsEligibilityQueryVariables>(client, TrialDeploymentsEligibilityDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteTrialDeploymentsEligibilityQuery.getKey = (variables: TrialDeploymentsEligibilityQueryVariables) => ['TrialDeploymentsEligibility.infinite', variables];
useInfiniteTrialDeploymentsEligibilityQuery.getRootKey = () => ['TrialDeploymentsEligibility.infinite'] as const;
useTrialDeploymentsEligibilityQuery.fetcher = (client: GraphQLClient, variables: TrialDeploymentsEligibilityQueryVariables, headers?: RequestInit['headers']) => fetcher<TrialDeploymentsEligibilityQuery, TrialDeploymentsEligibilityQueryVariables>(client, TrialDeploymentsEligibilityDocument, variables, headers);

export const UseCaseAddDocument = `
    mutation UseCaseAdd($input: AddUseCaseInput!) {
  addUseCase(input: $input) {
    ...UseCaseRow
  }
}
    ${UseCaseRowFragmentDoc}`;

export const useUseCaseAddMutation = <
      TError = unknown,
      TContext = unknown
    >(
      client: GraphQLClient,
      options?: UseMutationOptions<UseCaseAddMutation, TError, UseCaseAddMutationVariables, TContext>,
      headers?: RequestInit['headers']
    ) => {
    
    return useMutation<UseCaseAddMutation, TError, UseCaseAddMutationVariables, TContext>(
      {
    mutationKey: ['UseCaseAdd'],
    mutationFn: (variables?: UseCaseAddMutationVariables) => fetcher<UseCaseAddMutation, UseCaseAddMutationVariables>(client, UseCaseAddDocument, variables, headers)(),
    ...options
  }
    )};

useUseCaseAddMutation.getKey = () => ['UseCaseAdd'];
useUseCaseAddMutation.getRootKey = () => ['UseCaseAdd'] as const;
useUseCaseAddMutation.fetcher = (client: GraphQLClient, variables: UseCaseAddMutationVariables, headers?: RequestInit['headers']) => fetcher<UseCaseAddMutation, UseCaseAddMutationVariables>(client, UseCaseAddDocument, variables, headers);

export const UseCaseEditDocument = `
    mutation UseCaseEdit($id: ID!, $input: EditUseCaseInput!) {
  editUseCase(id: $id, input: $input) {
    ...UseCaseRow
  }
}
    ${UseCaseRowFragmentDoc}`;

export const useUseCaseEditMutation = <
      TError = unknown,
      TContext = unknown
    >(
      client: GraphQLClient,
      options?: UseMutationOptions<UseCaseEditMutation, TError, UseCaseEditMutationVariables, TContext>,
      headers?: RequestInit['headers']
    ) => {
    
    return useMutation<UseCaseEditMutation, TError, UseCaseEditMutationVariables, TContext>(
      {
    mutationKey: ['UseCaseEdit'],
    mutationFn: (variables?: UseCaseEditMutationVariables) => fetcher<UseCaseEditMutation, UseCaseEditMutationVariables>(client, UseCaseEditDocument, variables, headers)(),
    ...options
  }
    )};

useUseCaseEditMutation.getKey = () => ['UseCaseEdit'];
useUseCaseEditMutation.getRootKey = () => ['UseCaseEdit'] as const;
useUseCaseEditMutation.fetcher = (client: GraphQLClient, variables: UseCaseEditMutationVariables, headers?: RequestInit['headers']) => fetcher<UseCaseEditMutation, UseCaseEditMutationVariables>(client, UseCaseEditDocument, variables, headers);

export const UseCaseDeleteDocument = `
    mutation UseCaseDelete($id: ID!) {
  deleteUseCase(id: $id) {
    id
  }
}
    `;

export const useUseCaseDeleteMutation = <
      TError = unknown,
      TContext = unknown
    >(
      client: GraphQLClient,
      options?: UseMutationOptions<UseCaseDeleteMutation, TError, UseCaseDeleteMutationVariables, TContext>,
      headers?: RequestInit['headers']
    ) => {
    
    return useMutation<UseCaseDeleteMutation, TError, UseCaseDeleteMutationVariables, TContext>(
      {
    mutationKey: ['UseCaseDelete'],
    mutationFn: (variables?: UseCaseDeleteMutationVariables) => fetcher<UseCaseDeleteMutation, UseCaseDeleteMutationVariables>(client, UseCaseDeleteDocument, variables, headers)(),
    ...options
  }
    )};

useUseCaseDeleteMutation.getKey = () => ['UseCaseDelete'];
useUseCaseDeleteMutation.getRootKey = () => ['UseCaseDelete'] as const;
useUseCaseDeleteMutation.fetcher = (client: GraphQLClient, variables: UseCaseDeleteMutationVariables, headers?: RequestInit['headers']) => fetcher<UseCaseDeleteMutation, UseCaseDeleteMutationVariables>(client, UseCaseDeleteDocument, variables, headers);

export const UseCasesListDocument = `
    query UseCasesList($count: Int!, $orderBy: UseCaseOrdering!, $orderMode: OrderingMode!, $documentType: String, $product: FiligranProduct) {
  useCases(
    first: $count
    orderBy: $orderBy
    orderMode: $orderMode
    documentType: $documentType
    product: $product
  ) {
    totalCount
    edges {
      node {
        id
        name
        color
        product
      }
    }
  }
}
    `;

export const useUseCasesListQuery = <
      TData = UseCasesListQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: UseCasesListQueryVariables,
      options?: Omit<UseQueryOptions<UseCasesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UseCasesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<UseCasesListQuery, TError, TData>(
      {
    queryKey: ['UseCasesList', variables],
    queryFn: fetcher<UseCasesListQuery, UseCasesListQueryVariables>(client, UseCasesListDocument, variables, headers),
    ...options
  }
    )};

useUseCasesListQuery.getKey = (variables: UseCasesListQueryVariables) => ['UseCasesList', variables];
useUseCasesListQuery.getRootKey = () => ['UseCasesList'] as const;
export const useInfiniteUseCasesListQuery = <
      TData = InfiniteData<UseCasesListQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: UseCasesListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<UseCasesListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<UseCasesListQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<UseCasesListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['UseCasesList.infinite', variables],
      queryFn: (metaData) => fetcher<UseCasesListQuery, UseCasesListQueryVariables>(client, UseCasesListDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteUseCasesListQuery.getKey = (variables: UseCasesListQueryVariables) => ['UseCasesList.infinite', variables];
useInfiniteUseCasesListQuery.getRootKey = () => ['UseCasesList.infinite'] as const;
useUseCasesListQuery.fetcher = (client: GraphQLClient, variables: UseCasesListQueryVariables, headers?: RequestInit['headers']) => fetcher<UseCasesListQuery, UseCasesListQueryVariables>(client, UseCasesListDocument, variables, headers);

export const EpicCountPerTimelineQueryDocument = `
    query EpicCountPerTimelineQuery {
  countEpicsPerTimeline {
    timeline
    count
  }
}
    `;

export const useEpicCountPerTimelineQueryQuery = <
      TData = EpicCountPerTimelineQueryQuery,
      TError = unknown
    >(
      client: GraphQLClient,
      variables?: EpicCountPerTimelineQueryQueryVariables,
      options?: Omit<UseQueryOptions<EpicCountPerTimelineQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<EpicCountPerTimelineQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useQuery<EpicCountPerTimelineQueryQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['EpicCountPerTimelineQuery'] : ['EpicCountPerTimelineQuery', variables],
    queryFn: fetcher<EpicCountPerTimelineQueryQuery, EpicCountPerTimelineQueryQueryVariables>(client, EpicCountPerTimelineQueryDocument, variables, headers),
    ...options
  }
    )};

useEpicCountPerTimelineQueryQuery.getKey = (variables?: EpicCountPerTimelineQueryQueryVariables) => variables === undefined ? ['EpicCountPerTimelineQuery'] : ['EpicCountPerTimelineQuery', variables];
useEpicCountPerTimelineQueryQuery.getRootKey = () => ['EpicCountPerTimelineQuery'] as const;
export const useInfiniteEpicCountPerTimelineQueryQuery = <
      TData = InfiniteData<EpicCountPerTimelineQueryQuery>,
      TError = unknown
    >(
      client: GraphQLClient,
      variables: EpicCountPerTimelineQueryQueryVariables,
      options: Omit<UseInfiniteQueryOptions<EpicCountPerTimelineQueryQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<EpicCountPerTimelineQueryQuery, TError, TData>['queryKey'] },
      headers?: RequestInit['headers']
    ) => {
    
    return useInfiniteQuery<EpicCountPerTimelineQueryQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['EpicCountPerTimelineQuery.infinite'] : ['EpicCountPerTimelineQuery.infinite', variables],
      queryFn: (metaData) => fetcher<EpicCountPerTimelineQueryQuery, EpicCountPerTimelineQueryQueryVariables>(client, EpicCountPerTimelineQueryDocument, {...variables, ...(metaData.pageParam ?? {})}, headers)(),
      ...restOptions
    }
  })()
    )};

useInfiniteEpicCountPerTimelineQueryQuery.getKey = (variables?: EpicCountPerTimelineQueryQueryVariables) => variables === undefined ? ['EpicCountPerTimelineQuery.infinite'] : ['EpicCountPerTimelineQuery.infinite', variables];
useInfiniteEpicCountPerTimelineQueryQuery.getRootKey = () => ['EpicCountPerTimelineQuery.infinite'] as const;
useEpicCountPerTimelineQueryQuery.fetcher = (client: GraphQLClient, variables?: EpicCountPerTimelineQueryQueryVariables, headers?: RequestInit['headers']) => fetcher<EpicCountPerTimelineQueryQuery, EpicCountPerTimelineQueryQueryVariables>(client, EpicCountPerTimelineQueryDocument, variables, headers);
