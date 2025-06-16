import { graphql } from 'react-relay';
export const SettingsContext_fragment = graphql`
  fragment settingsContext_fragment on Settings {
    platform_providers {
      name
      provider
      type
    }
    environment
    base_url_front
    platform_feature_flags {
      id
      enabled
    }
  }
`;

export const SettingsQuery = graphql`
  query settingsQuery {
    settings {
      platform_providers {
        name
        provider
        type
      }
      base_url_front
      platform_feature_flags {
        id
        enabled
      }
    }
  }
`;

export const SettingsContextQuery = graphql`
  query settingsContextQuery {
    settings {
      ...settingsContext_fragment
    }
  }
`;
