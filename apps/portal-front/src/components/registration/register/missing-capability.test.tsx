import { RegistrationContext } from '@/components/registration/context';
import { RegisterStateMissingCapability } from '@/components/registration/register/missing-capability';
import testRender from '@/utils/test/test-render';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  useTranslations: () => (key: string) => key,
}));

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
        displayedIdentifier: 'OpenCTI',
        capability: OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
      }}>
      <RegisterStateMissingCapability
        organizationId="org-id"
        cancel={cancel}
      />
    </RegistrationContext.Provider>
  );

describe('RegisterStateMissingCapability', () => {
  it('renders the capability error title', () => {
    renderMissingCapability();
    expect(
      screen.getByText('Register.Error.Capability.Title')
    ).toBeInTheDocument();
  });

  it('renders the capability description', () => {
    renderMissingCapability();
    expect(
      screen.getByText('Register.Error.Capability.Description')
    ).toBeInTheDocument();
  });

  it('renders the admin list title', () => {
    renderMissingCapability();
    expect(
      screen.getByText('Register.Error.Capability.AdminListTitle')
    ).toBeInTheDocument();
  });

  it('renders all administrators returned by the query', () => {
    renderMissingCapability();
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
