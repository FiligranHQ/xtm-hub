import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestUseCase,
} from '../../__generated__/resolvers-types';
import {
  TELEMETRY_SOURCE,
  TelemetryEventService,
  TelemetryEventServiceType,
  TelemetryOrganizationType,
  TelemetryTargetProduct,
} from './telemetry.const';

export enum TelemetryEventType {
  LOGIN = 'login',
  SUBSCRIBE = 'subscribe',
  SHARE = 'share',
  DOWNLOAD = 'download',
  CREATE = 'create',
  REGISTER = 'register',
  ONE_CLICK_DEPLOY = 'one_click_deploy',
  UPDATE_ORGANIZATION = 'update_organization',
  CREATE_ORGANIZATION = 'create_organization',
  CREATE_DEPLOYMENT = 'create_deployment',
  UPDATE_DEPLOYMENT = 'update_deployment',
}

export interface BaseTelemetryEvent {
  event_type: string;
  organization_id: string;
  organization_name: string;
  organization_type: TelemetryOrganizationType;
  user_id: string;
  '@timestamp': string;
  source: typeof TELEMETRY_SOURCE;
}

export interface LoginEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.LOGIN;
}

export interface SubscribeEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.SUBSCRIBE;
  service: TelemetryEventService;
  service_type?: TelemetryEventServiceType;
}

export interface ShareEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.SHARE;
  service: TelemetryEventService;
  service_type?: TelemetryEventServiceType;
  resource_id: string;
  resource_title: string;
}

export interface DownloadEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.DOWNLOAD;
  service: TelemetryEventService;
  service_type?: TelemetryEventServiceType;
  resource_id: string;
  resource_title: string;
}

export interface CreateEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.CREATE;
  service: TelemetryEventService;
  service_type?: TelemetryEventServiceType;
  resource_id: string;
  resource_title: string;
  status: string;
}

export interface RegisterPlatformEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.REGISTER;
  target_product: TelemetryTargetProduct;
  platform_id: string;
  platform_contract: string;
  platform_version: string;
  platform_url: string;
}

export interface OneClickDeployEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.ONE_CLICK_DEPLOY;
  target_product: TelemetryTargetProduct;
  service: TelemetryEventService;
  service_type?: TelemetryEventServiceType;
  resource_id: string;
  platform_id: string;
  platform_version: string;
  resource_title: string;
}

export interface UpdateOrganizationEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.UPDATE_ORGANIZATION;
  domains: string[];
}

export interface CreateOrganizationEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.CREATE_ORGANIZATION;
  domains: string[];
}

export interface CreateDeploymentEvent extends BaseTelemetryEvent {
  activity_sector: DeploymentRequestActivitySector;
  deployment_id: string;
  deployment_type: DeploymentRequestDeploymentType;
  email: string;
  event_type: TelemetryEventType.CREATE_DEPLOYMENT;
  job_title: string;
  region: DeploymentRequestPlatformRegion;
  status: DeploymentRequestHubStatus;
  use_case: DeploymentRequestUseCase;
  target_product: TelemetryTargetProduct;
}

export interface UpdateDeploymentEvent extends BaseTelemetryEvent {
  deployment_id: string;
  deployment_type: DeploymentRequestDeploymentType;
  start_date: Date;
  end_date: Date;
  platform_id: string;
  status?: DeploymentRequestHubStatus;
  cancellation_reason?: string;
}

export type TelemetryEvent =
  | LoginEvent
  | SubscribeEvent
  | ShareEvent
  | DownloadEvent
  | CreateEvent
  | RegisterPlatformEvent
  | OneClickDeployEvent
  | UpdateOrganizationEvent
  | CreateOrganizationEvent
  | CreateDeploymentEvent
  | UpdateDeploymentEvent;
