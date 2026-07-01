import {
  ManifestType,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';

export enum ManifestRebuildQueueStatus {
  Pending = 'pending',
  Processing = 'processing',
}

export type ManifestKey = {
  platformIdentifier: PlatformIdentifier;
  version: string;
  type: ManifestType;
};
