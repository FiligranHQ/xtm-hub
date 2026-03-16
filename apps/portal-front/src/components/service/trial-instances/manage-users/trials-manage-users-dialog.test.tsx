import testRender from '@/utils/test/test-render';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrialsManageUsersDialog } from './trials-manage-users-dialog';

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslations: () => (key: string) => key,
}));

vi.mock(
  '@/components/service/trial-instances/manage-users/trials-manage-users-form',
  () => ({
    TrialsManageUsersForm: () => <div>ManageUsersForm</div>,
  })
);

const loadQueryMock = vi.fn();

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useQueryLoader: () => [null, loadQueryMock],
}));

describe('TrialsManageUsersDialog', () => {
  it('should not call loadQuery on mount', () => {
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />
    );
    expect(loadQueryMock).not.toHaveBeenCalled();
  });

  it('should call loadQuery only when dialog is opened', async () => {
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />
    );
    expect(loadQueryMock).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(loadQueryMock).toHaveBeenCalledOnce();
    expect(loadQueryMock).toHaveBeenCalledWith(
      { serviceInstanceId: 'service-123' },
      { fetchPolicy: 'store-and-network' }
    );
  });
});
