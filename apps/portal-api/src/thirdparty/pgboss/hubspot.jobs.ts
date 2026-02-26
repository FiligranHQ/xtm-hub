export type HubspotWebhookType = 'login' | 'reachOutSales';

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
  job_title: string | null;
  message: string;
}

export interface HubspotPayloadMap {
  login: HubspotLoginPayload;
  reachOutSales: HubspotReachOutSalesPayload;
}

export const HUBSPOT_QUEUES = {
  LOGIN: 'hubspot.login',
  REACH_OUT_SALES: 'hubspot.reach_out_sales',
  DEAD_LETTER: 'hubspot.deadletter',
} as const;

export type HubspotQueueName =
  | typeof HUBSPOT_QUEUES.LOGIN
  | typeof HUBSPOT_QUEUES.REACH_OUT_SALES;

export const HUBSPOT_TYPE_TO_QUEUE = {
  login: HUBSPOT_QUEUES.LOGIN,
  reachOutSales: HUBSPOT_QUEUES.REACH_OUT_SALES,
} as const satisfies Record<HubspotWebhookType, HubspotQueueName>;

export interface HubspotJobData<
  T extends HubspotWebhookType = HubspotWebhookType,
> {
  type: T;
  payload: HubspotPayloadMap[T];
}
