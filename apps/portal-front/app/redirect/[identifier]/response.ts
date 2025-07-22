import { settingsQuery$data } from '@generated/settingsQuery.graphql';

export interface SettingsResponse {
  data: settingsQuery$data;
}

export interface MeResponse {
  data: {
    me: {
      id: string;
      selected_organization_id: string;
      organizations: {
        id: string;
        name: string;
        personal_space: boolean;
      }[];
    };
  };
}
