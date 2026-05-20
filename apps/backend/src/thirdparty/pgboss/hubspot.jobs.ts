export type HubspotWebhookType = 'login' | 'reachOutSales' | 'mailSent';

export interface HubspotLoginPayload {
  email: string | null;
  first_login: boolean;
  last_login: Date | null;
  is_admin: boolean;
}

export interface HubspotReachOutSalesPayload {
  email: string | null;
  firstname: string | null | undefined;
  lastname: string | null | undefined;
  company: string;
  message: string;
}

export interface HubspotMailSentPayload {
  subject: string;
  timestamp: string;
  deployment_id: string;
  deployment_status: string;
}

export interface HubspotPayloadMap {
  login: HubspotLoginPayload;
  reachOutSales: HubspotReachOutSalesPayload;
  mailSent: HubspotMailSentPayload;
}

export const HUBSPOT_QUEUES = {
  LOGIN: 'hubspot.login',
  REACH_OUT_SALES: 'hubspot.reach_out_sales',
  MAIL_SENT: 'hubspot.mailSent',
  DEAD_LETTER: 'hubspot.deadletter',
} as const;

export type HubspotQueueName =
  | typeof HUBSPOT_QUEUES.LOGIN
  | typeof HUBSPOT_QUEUES.REACH_OUT_SALES
  | typeof HUBSPOT_QUEUES.MAIL_SENT;

export const HUBSPOT_TYPE_TO_QUEUE = {
  login: HUBSPOT_QUEUES.LOGIN,
  reachOutSales: HUBSPOT_QUEUES.REACH_OUT_SALES,
  mailSent: HUBSPOT_QUEUES.MAIL_SENT,
} as const satisfies Record<HubspotWebhookType, HubspotQueueName>;

export interface HubspotJobData<
  T extends HubspotWebhookType = HubspotWebhookType,
> {
  type: T;
  payload: HubspotPayloadMap[T];
}
