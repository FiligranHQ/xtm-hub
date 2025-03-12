import { graphql } from 'react-relay';

export const SettingsQuery = graphql`
  query settingsQuery {
    settings {
      platform_providers {
        name
        provider
        type
      }
      base_url_front
    }
  }
`;
