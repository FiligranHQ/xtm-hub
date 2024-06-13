import React from 'react';
import testRender from '@/utils/test/test-render';
import { OrganizationSheet } from '@/components/organization/organization-sheet';

describe('OrganizationCreateSheet component', () => {
  it('render', async () => {
    const element = testRender(
      <OrganizationSheet
        onAddedOrganization={() => {}}
        onEditedOrganization={() => {}}
        currentOrganization={undefined}>
        <button>Create</button>
      </OrganizationSheet>
    );

    expect(!!element).toBe(true);
  });

  // Other tests removed in favor of e2e tests.
});
