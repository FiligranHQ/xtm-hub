export interface ServiceListFacetCounts {
  useCase?: Record<string, number>;
  entityType?: Record<string, number>;
  integrationType?: Record<string, number>;
  managerSupported?: Record<string, number>;
  verified?: Record<string, number>;
  productVersion?: Record<string, number>;
  solutionCategory?: Record<string, number>;
  licenseType?: Record<string, number>;
}

export const withFacetCount = (
  label: string,
  optionValue: string,
  facetCounts?: Record<string, number>
) => {
  if (!facetCounts) {
    return label;
  }
  return `${label} (${facetCounts[optionValue] ?? 0})`;
};
