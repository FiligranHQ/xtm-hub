import { RegistrationContext } from '@/components/registration/context';
import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { RegisterOrganizationForm } from '@/components/registration/register/organization-form';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { organizationListUserOrganizationsQuery$data } from '@generated/organizationListUserOrganizationsQuery.graphql';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  useTranslations: () => (key: string) => key,
}));

vi.mock('@filigran/ui/clients', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@filigran/ui/clients')>()),
  FormControl: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FormItem: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  FormLabel: ({
    children,
    id,
    className,
  }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
  }) => (
    <label
      id={id}
      className={className}>
      {children}
    </label>
  ),
  FormMessage: () => null,
}));

type AutoFormMockProps = {
  onSubmit: (values: { organizationId: string }) => void;
  children: React.ReactNode;
  fieldConfig?: {
    organizationId?: {
      fieldType?: (props: {
        field: { value: string; onChange: (v: string) => void };
      }) => React.ReactNode;
    };
  };
  values?: { organizationId: string };
};

vi.mock('@filigran/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@filigran/ui')>()),
  AutoForm: ({
    onSubmit,
    children,
    fieldConfig,
    values,
  }: AutoFormMockProps) => {
    const fieldElement = fieldConfig?.organizationId?.fieldType?.({
      field: {
        value: values?.organizationId ?? '',
        onChange: vi.fn(),
      },
    });
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ organizationId: values?.organizationId ?? '' });
        }}>
        {fieldElement}
        {children}
      </form>
    );
  },
}));

const twoOrgs: organizationListUserOrganizationsQuery$data = {
  userOrganizations: [
    { id: 'org-1', name: 'Org One' },
    { id: 'org-2', name: 'Org Two' },
  ],
};

const renderForm = (
  orgs: organizationListUserOrganizationsQuery$data = twoOrgs,
  cancel: () => void = vi.fn(),
  confirm: (id: string) => void = vi.fn()
) =>
  testRender(
    <RegistrationContext.Provider
      value={{
        displayedIdentifier:
          PlatformMetadataMapping[PlatformIdentifierEnum.OPENCTI].name,
      }}>
      <RegisterOrganizationForm
        userOrganizationsQueryData={orgs}
        cancel={cancel}
        confirm={confirm}
      />
    </RegistrationContext.Provider>
  );

describe('RegisterOrganizationForm', () => {
  it('renders the whole component properly', () => {
    renderForm();
    expect(screen.getByText('Org One')).toBeInTheDocument();
    expect(screen.getByText('Org Two')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(
      screen.getByText('Register.OrganizationForm.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Register.OrganizationForm.Description')
    ).toBeInTheDocument();
  });

  it('calls cancel when the cancel button is clicked', async () => {
    const cancel = vi.fn();
    const { user } = renderForm(twoOrgs, cancel);
    await user.click(screen.getByRole('button', { name: 'Utils.Cancel' }));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('calls confirm with the first organization id when the form is submitted', () => {
    const confirm = vi.fn();
    renderForm(twoOrgs, vi.fn(), confirm);
    fireEvent.submit(
      screen.getByRole('button', { name: 'Register.Confirm' }).closest('form')!
    );
    expect(confirm).toHaveBeenCalledWith('org-1');
  });

  it('renders no radio buttons when there are no organizations', () => {
    renderForm({ userOrganizations: [] });
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });
});
