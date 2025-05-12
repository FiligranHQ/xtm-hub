import { ServiceDefinitionIdentifier } from '@generated/serviceInstancesSubscribedByIdentifierQuery.graphql';

// Type guard for ServiceDefinitionIdentifier
export function isValidServiceDefinitionIdentifier(
  value: unknown
): value is ServiceDefinitionIdentifier {
  return (
    typeof value === 'string' &&
    ['custom_dashboards', 'link', 'vault', 'csv_feeds'].includes(value)
  );
}
