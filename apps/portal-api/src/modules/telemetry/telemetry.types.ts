export enum TelemetryEventType {
  LOGIN = 'login,',
  SUBSCRIBE = 'subscribe',
  SHARE = 'share',
  DOWNLOAD = 'download',
  CREATE = 'create',
  REGISTER = 'register',
  ONE_CLICK_DEPLOY = 'one_click_deploy',
}

export interface BaseTelemetryEvent {
  event_type: string;
  organization_id: string;
  organization_name: string;
  user_id: string;
  '@timestamp': string;
  source: 'xtm-hub';
}

export interface LoginEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.LOGIN;
}

export interface SubscribeEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.SUBSCRIBE;
  service: string;
  service_type?: string;
}

export interface ShareEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.SHARE;
  service: string;
  service_type?: string;
  resource_id: string;
  resource_title: string;
}

export interface DownloadEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.DOWNLOAD;
  service: string;
  service_type?: string;
  resource_id: string;
  resource_title: string;
}

export interface CreateEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.CREATE;
  service: string;
  service_type?: string;
  resource_id: string;
  resource_title: string;
  status: string;
}

export interface RegisterPlatformEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.REGISTER;
  target_product: string;
  platform_id: string;
  organization_type: string;
}

export interface OneClickDeployEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.ONE_CLICK_DEPLOY;
  target_product: string;
  service: string;
  service_type?: string;
  resource_id: string;
  platform_id: string;
  resource_title: string;
}

export type TelemetryEvent =
  | LoginEvent
  | SubscribeEvent
  | ShareEvent
  | DownloadEvent
  | CreateEvent
  | RegisterPlatformEvent
  | OneClickDeployEvent;
