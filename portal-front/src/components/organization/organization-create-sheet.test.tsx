import React from 'react';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';
import testRender from '@/utils/test/test-render';

describe('OrganizationCreateSheet component', () => {
  it('render', async () => {
    const element = testRender(
      <OrganizationCreateSheet setAddedOrganization={() => {}} />
    );

    expect(!!element).toBe(true);
  });
});
