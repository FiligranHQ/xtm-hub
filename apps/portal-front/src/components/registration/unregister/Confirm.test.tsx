import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegistrationContext } from '../Context';
import { UnregisterConfirm } from './Confirm';

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  useTranslations: () => (key: string) => key,
}));

vi.mock('../../organization/Organization.service', () => ({
  getOrganization: vi.fn(() => ({ id: 'org-id', name: 'Test Organization' })),
}));

const renderConfirm = (
  props: { confirm?: () => void; cancel?: () => void } = {}
) =>
  testRender(
    <RegistrationContext.Provider
      value={{
        displayedIdentifier:
          PlatformMetadataMapping[PlatformIdentifierEnum.OPENCTI].name,
      }}>
      <UnregisterConfirm
        organizationId="org-id"
        confirm={props.confirm ?? vi.fn()}
        cancel={props.cancel ?? vi.fn()}
      />
    </RegistrationContext.Provider>
  );

describe('UnregisterConfirm', () => {
  it('renders the confirmation title and description', () => {
    renderConfirm();
    expect(screen.getByText('Unregister.Confirm.Title')).toBeInTheDocument();
    expect(
      screen.getByText('Unregister.Confirm.Description')
    ).toBeInTheDocument();
  });

  it('calls confirm when the confirm button is clicked', async () => {
    const confirm = vi.fn();
    const { user } = renderConfirm({ confirm });
    await user.click(screen.getByRole('button', { name: 'Utils.Confirm' }));
    expect(confirm).toHaveBeenCalledOnce();
  });

  it('calls cancel when the cancel button is clicked', async () => {
    const cancel = vi.fn();
    const { user } = renderConfirm({ cancel });
    await user.click(screen.getByRole('button', { name: 'Register.Back' }));
    expect(cancel).toHaveBeenCalledOnce();
  });
});
