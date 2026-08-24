import {
  getBundleRolePanels,
  ROLE_PANELS,
} from '@/components/service/bundle/manage-trial/manage-trial.const';
import { PlatformIdentifier } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('getBundleRolePanels', () => {
  it('returns only the role panels matching the given products', () => {
    expect(
      getBundleRolePanels([PlatformIdentifier.Opencti]).map(
        ({ platform }) => platform
      )
    ).toEqual([PlatformIdentifier.Opencti]);
  });

  it('returns the role panels in ROLE_PANELS order, not in the products order', () => {
    expect(
      getBundleRolePanels([
        PlatformIdentifier.Xtmone,
        PlatformIdentifier.Opencti,
      ]).map(({ platform }) => platform)
    ).toEqual([PlatformIdentifier.Opencti, PlatformIdentifier.Xtmone]);
  });

  it('returns every role panel when every product is given', () => {
    expect(getBundleRolePanels(Object.values(PlatformIdentifier))).toEqual(
      ROLE_PANELS
    );
  });

  it('returns no role panel when no product is given', () => {
    expect(getBundleRolePanels([])).toEqual([]);
  });
});
