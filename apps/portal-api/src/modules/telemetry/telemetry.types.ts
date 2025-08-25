export enum TelemetryEventType {
  LOGIN = 'login,',
  SUBSCRIBE = 'subscribe',
  SHARE = 'share',
  DOWNLOAD = 'download',
  CREATE = 'create',
  ENROLL = 'enroll',
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
  subscribed_service: string;
}

export interface ShareEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.SHARE;
  service: string;
  resource_id: string;
  resource_title: string;
}

export interface DownloadEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.DOWNLOAD;
  service: string;
  resource_id: string;
  resource_title: string;
}

export interface CreateEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.CREATE;
  service: string;
  resource_id: string;
  resource_title: string;
  status: string;
}

export interface EnrollEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.ENROLL;
  target_product: string;
  platform_id: string;
  organization_type: string;
}

export interface OneClickDeployEvent extends BaseTelemetryEvent {
  event_type: TelemetryEventType.ONE_CLICK_DEPLOY;
  target_product: string;
  service: string;
  resource_id: string;
  platform_id: string;
}

export type TelemetryEvent =
  | LoginEvent
  | SubscribeEvent
  | ShareEvent
  | DownloadEvent
  | CreateEvent
  | EnrollEvent
  | OneClickDeployEvent;
