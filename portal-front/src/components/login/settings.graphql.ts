import { graphql } from 'react-relay';
export const SettingsContext_fragment = graphql`
  fragment settingsContext_fragment on Settings {
    platform_providers {
      name
      provider
      type
    }
    feature_flags {
      id
      enabled
    }
    environment
    base_url_front
  }
`;

export const SettingsContextQuery = graphql`
  query settingsContextQuery {
    settings {
      ...settingsContext_fragment
    }
  }
`;
