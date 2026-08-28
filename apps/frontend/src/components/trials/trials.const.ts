import {
  DeploymentRequestHubStatus,
  DeploymentRequestOrdering,
  DeploymentRequestPlatformRegion,
  OrderingMode,
  PlatformIdentifier,
} from '@graphql/generated';

export enum TrialsTabType {
  Cancelled = 'cancelled',
  Expired = 'expired',
  Running = 'running',
  Waiting = 'waiting',
}

export const TRIALS_TAB_CONFIG: Record<
  TrialsTabType,
  {
    statuses: DeploymentRequestHubStatus[];
    defaultOrder: DeploymentRequestOrdering;
    defaultOrderMode: OrderingMode;
  }
> = {
  [TrialsTabType.Cancelled]: {
    statuses: [DeploymentRequestHubStatus.Cancelled],
    defaultOrder: DeploymentRequestOrdering.RequestDate,
    defaultOrderMode: OrderingMode.Desc,
  },
  [TrialsTabType.Expired]: {
    statuses: [DeploymentRequestHubStatus.Expired],
    defaultOrder: DeploymentRequestOrdering.RequestDate,
    defaultOrderMode: OrderingMode.Desc,
  },
  [TrialsTabType.Running]: {
    statuses: [
      DeploymentRequestHubStatus.Active,
      DeploymentRequestHubStatus.Pending,
      DeploymentRequestHubStatus.Provisioning,
    ],
    defaultOrder: DeploymentRequestOrdering.RequestDate,
    defaultOrderMode: OrderingMode.Desc,
  },
  [TrialsTabType.Waiting]: {
    statuses: [DeploymentRequestHubStatus.Queued],
    defaultOrder: DeploymentRequestOrdering.Ordering,
    defaultOrderMode: OrderingMode.Asc,
  },
};

export const TRIALS_PRODUCT_ORDER: PlatformIdentifier[] = [
  PlatformIdentifier.Opencti,
  PlatformIdentifier.Openaev,
  PlatformIdentifier.Xtmone,
];

export const trialsRegionKey = (
  region: DeploymentRequestPlatformRegion
): string => `Region.${region.toUpperCase()}`;

export type TrialsScope =
  | { kind: 'bundle' }
  | { kind: 'product'; platformIdentifier: PlatformIdentifier };

export const BUNDLE_SCOPE: TrialsScope = { kind: 'bundle' };

export const productScope = (
  platformIdentifier: PlatformIdentifier
): TrialsScope => ({ kind: 'product', platformIdentifier });

export const trialsScopeKey = (scope: TrialsScope): string =>
  scope.kind === 'bundle' ? 'bundle' : scope.platformIdentifier;

export const trialsScopeMessage = (
  scope: TrialsScope,
  suffix: string
): string =>
  `ManageTrials.${scope.kind === 'bundle' ? 'Bundle' : 'Trial'}.${suffix}`;
