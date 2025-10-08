export interface ManifestInformation {
  version: string;
  name: string;
  description: string;
  shortDescription: string;
  containerImage?: string | null; // Docker/container identifier
  slug: string;
  logo: string; // URL or path to logo
  verified: boolean;
  containerType: string; // e.g., 'docker', 'kubernetes', etc.
  useCases: string[];
  sourceCode?: string | null; // URL to repository
  subscriptionLink?: string | null; // URL to subscription page
}
