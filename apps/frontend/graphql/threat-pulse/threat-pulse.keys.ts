import {
  type ThreatPulsePlatformsQueryVariables,
  type ThreatPulseTrendingQueryVariables,
  useThreatPulseOverviewQuery,
  useThreatPulsePlatformsQuery,
  useThreatPulseTrendingQuery,
} from '@graphql/generated';

export const threatPulseKeys = {
  overview: () => useThreatPulseOverviewQuery.getKey(),
  trending: (variables: ThreatPulseTrendingQueryVariables) =>
    useThreatPulseTrendingQuery.getKey(variables),
  platforms: (variables: ThreatPulsePlatformsQueryVariables) =>
    useThreatPulsePlatformsQuery.getKey(variables),
};
