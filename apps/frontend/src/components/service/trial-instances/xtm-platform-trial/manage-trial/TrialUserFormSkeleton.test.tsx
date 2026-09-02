import {
  getBundleRolePanels,
  trialUserRolesFormSchema,
  TrialUserRolesFormValues,
} from '@/components/service/trial-instances/xtm-platform-trial/manage-trial/manage-trial.const';
import { MixedRoleDefault } from '@/components/service/trial-instances/xtm-platform-trial/manage-trial/manage-trial.utils';
import { TrialUserFormSkeleton } from '@/components/service/trial-instances/xtm-platform-trial/manage-trial/TrialUserFormSkeleton';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier, ServiceGroupName } from '@graphql/generated';
import { zodResolver } from '@hookform/resolvers/zod';
import { screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

const products = [PlatformIdentifier.Opencti, PlatformIdentifier.Xtmone];
const bundleRolePanels = getBundleRolePanels(products);
const usersOptions = [{ label: 'user1@filigran.io', value: 'user-1' }];

interface WrapperProps {
  onSubmit: (values: TrialUserRolesFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
  pickerLabel?: string;
  mixedRoleDefaults?: Partial<Record<PlatformIdentifier, MixedRoleDefault>>;
  defaultUserIds?: string[];
}

const Wrapper = ({
  onSubmit,
  onCancel,
  isPending = false,
  pickerLabel,
  mixedRoleDefaults,
  defaultUserIds = [],
}: WrapperProps) => {
  const form = useForm<TrialUserRolesFormValues>({
    resolver: zodResolver(trialUserRolesFormSchema),
    defaultValues: {
      userIds: defaultUserIds,
      xtmoneRole: ServiceGroupName.User,
    },
  });

  return (
    <TrialUserFormSkeleton
      form={form}
      onSubmit={onSubmit}
      usersOptions={usersOptions}
      pickerLabel={pickerLabel}
      pickerPlaceholder="Pick a user"
      products={products}
      bundleRolePanels={bundleRolePanels}
      mixedRoleDefaults={mixedRoleDefaults}
      onCancel={onCancel}
      isPending={isPending}
    />
  );
};

const openUserPicker = async (user: { click: (el: Element) => unknown }) => {
  await user.click(screen.getByText('Pick a user'));
};

describe('TrialUserFormSkeleton', () => {
  it('renders the user picker label only when provided', () => {
    testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        pickerLabel="Users"
      />
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('does not render a user picker label when none is provided', () => {
    testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('disables Confirm when no user is selected', () => {
    testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Utils.Confirm' })
    ).toBeDisabled();
  });

  it('enables Confirm once a user is selected', async () => {
    const { user } = testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await openUserPicker(user);
    await user.click(await screen.findByText('user1@filigran.io'));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Utils.Confirm' })
      ).not.toBeDisabled();
    });
  });

  it('disables Confirm while isPending, even with a user selected', () => {
    testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isPending
        defaultUserIds={['user-1']}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Utils.Confirm' })
    ).toBeDisabled();
  });

  it('disables Confirm while a mixed role panel has not been resolved', () => {
    testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        defaultUserIds={['user-1']}
        mixedRoleDefaults={{
          [PlatformIdentifier.Opencti]: { isMixed: true },
        }}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Utils.Confirm' })
    ).toBeDisabled();
  });

  it('calls onSubmit with the form values when Confirm is clicked', async () => {
    const onSubmit = vi.fn();
    const { user } = testRender(
      <Wrapper
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await openUserPicker(user);
    await user.click(await screen.findByText('user1@filigran.io'));
    await user.click(screen.getByRole('button', { name: 'Utils.Confirm' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ userIds: ['user-1'] }),
        expect.anything()
      );
    });
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    const { user } = testRender(
      <Wrapper
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Utils.Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
