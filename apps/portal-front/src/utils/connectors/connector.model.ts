export interface Connector {
  id: string;
  name: string;
  description: string;
  version: string;
  contracts: Contract[];
}

export interface Contract {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  logo: string;
  use_cases: string[];
  verified: boolean;
  last_verified_date: string;
  playbook_supported: boolean;
  max_confidence_level: number;
  support_version: string;
  subscription_link: string;
  source_code: string;
  manager_supported: boolean;
  container_version: string;
  container_image: string;
  container_type: string;
  config_schema?: ConfigSchema;
}

export interface ConfigSchema {
  $schema: string;
  $id: string;
  type: string;
  required: string[];
  additionalProperties: boolean;
}
