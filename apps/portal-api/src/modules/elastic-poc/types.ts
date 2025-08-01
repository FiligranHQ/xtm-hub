export interface BaseTelemetryEvent {
  event_type: string;
  organization_id: string;
  organization_name: string;
  user_id: string;
  '@timestamp': string;
  source: 'xtm-hub';
}

export interface LoginEvent extends BaseTelemetryEvent {
  event_type: 'login';
}

export interface SubscribeEvent extends BaseTelemetryEvent {
  event_type: 'subscribe';
  subscribed_service: string;
}

export interface ShareEvent extends BaseTelemetryEvent {
  event_type: 'share';
  service: string;
  resource_id: string;
  resource_title: string;
}

export interface DownloadEvent extends BaseTelemetryEvent {
  event_type: 'download';
  service: string;
  resource_id: string;
  resource_title: string;
}

export interface CreateEvent extends BaseTelemetryEvent {
  event_type: 'create';
  service: string;
  resource_id: string;
  resource_title: string;
  status: string;
}

export interface EnrollEvent extends BaseTelemetryEvent {
  event_type: 'enroll';
  target_product: string;
  platform_id: string;
  organization_type: string;
  platform_contract: 'EE' | 'CE';
}

export interface OneClickDeployEvent extends BaseTelemetryEvent {
  event_type: 'one_click_deploy';
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
