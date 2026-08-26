import { ActiveXtmPlatformBundleQuery } from '@graphql/generated';

export type XtmPlatformBundleData = NonNullable<
  ActiveXtmPlatformBundleQuery['activeXtmPlatformBundle']
>;

export type XtmPlatformBundleProduct =
  XtmPlatformBundleData['products'][number];
