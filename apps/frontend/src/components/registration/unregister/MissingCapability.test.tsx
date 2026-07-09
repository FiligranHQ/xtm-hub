import { RegistrationContext } from '@/components/registration/Context';
import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { UnregisterMissingCapability } from '@/components/registration/unregister/MissingCapability';
import testRender from '@/utils/test/test-render';
import { OrganizationCapability, PlatformIdentifier } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useLazyLoadQuery: () => ({
    usersWithCapabilitiesInOrganization: [
      {
        id: 'user-1',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@example.com',
      },
      {
        id: 'user-2',
        first_name: 'Bob',
        last_name: 'Jones',
        email: 'bob@example.com',
      },
    ],
  }),
}));

const renderMissingCapability = (cancel: () => void = vi.fn()) =>
  testRender(
    <RegistrationContext.Provider
      value={{
        displayedIdentifier:
          PlatformMetadataMapping[PlatformIdentifier.Opencti].name,
        capability: OrganizationCapability.ManagePlatformRegistration,
      }}>
      <UnregisterMissingCapability
        organizationId="org-id"
        cancel={cancel}
      />
    </RegistrationContext.Provider>
  );

describe('UnregisterMissingCapability', () => {
  it('renders the whole component properly', () => {
    renderMissingCapability();
    expect(
      screen.getByText('Unregister.Error.Capability.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Unregister.Error.Capability.AdminListTitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Unregister.Error.Capability.Description')
    ).toBeInTheDocument();
    expect(screen.getByText(/Alice Smith/)).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Bob Jones/)).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
  });

  it('calls cancel when the cancel button is clicked', async () => {
    const cancel = vi.fn();
    const { user } = renderMissingCapability(cancel);
    await user.click(screen.getByRole('button', { name: 'Register.Back' }));
    expect(cancel).toHaveBeenCalledOnce();
  });
});
