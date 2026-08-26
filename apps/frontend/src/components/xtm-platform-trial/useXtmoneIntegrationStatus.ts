'use client';

import { useQuery } from '@tanstack/react-query';

export interface XtmoneIntegrationStatusEntry {
  status: string;
  connected: boolean;
  last_checked_at: string | null;
}

export interface XtmoneIntegrationStatus {
  opencti: XtmoneIntegrationStatusEntry;
  openaev: XtmoneIntegrationStatusEntry;
  linked: boolean;
  last_checked_at: string | null;
}

interface XtmonePlatformConfigResponse {
  integration_status?: XtmoneIntegrationStatus;
}

export interface XtmoneStatusState {
  data?: XtmoneIntegrationStatus;
  isLoading: boolean;
  isError: boolean;
  hasUrl: boolean;
}

const XTMONE_STATUS_TIMEOUT_MS = 8000;

const fetchXtmoneIntegrationStatus = async (
  baseUrl: string
): Promise<XtmoneIntegrationStatus> => {
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/platform/config`;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    XTMONE_STATUS_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }
    const body = (await response.json()) as XtmonePlatformConfigResponse;
    if (!body?.integration_status) {
      throw new Error('Missing integration_status in platform config');
    }
    return body.integration_status;
  } finally {
    clearTimeout(timeout);
  }
};

export const useXtmoneIntegrationStatus = (baseUrl?: string | null) =>
  useQuery({
    queryKey: ['xtmone-integration-status', baseUrl],
    queryFn: () => fetchXtmoneIntegrationStatus(baseUrl as string),
    enabled: !!baseUrl,
    retry: false,
    staleTime: 60_000,
  });
