'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@filigran/ui';
import { MultiSelectFormField } from '@filigran/ui/clients';
import {
  FilterKey,
  OrderingMode,
  PlatformIdentifier,
  ServiceGroupName,
  UserOrdering,
  useAddUsersToBundleGroupsMutation,
  useBundleUserServiceGroupsQuery,
  useUsersQuery,
} from '@graphql/generated';
import { bundleUserServiceGroupsKeys } from '@graphql/service-group/service-group.keys';
import { usersKeys } from '@graphql/user/users.keys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { ManageTrialRoleDescriptions } from './ManageTrialRoleDescriptions';
import { getBundleRolePanels } from './manage-trial.const';

interface AddTrialUserFormProps {
  serviceInstanceId: string;
  products?: PlatformIdentifier[];
  onCompleted: () => void;
  onCancel: () => void;
}

type RoleFormField = `${PlatformIdentifier}Role`;

const addTrialUserFormSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  openctiRole: z.enum(ServiceGroupName).optional(),
  openaevRole: z.enum(ServiceGroupName).optional(),
  xtmoneRole: z.enum(ServiceGroupName),
});

type AddTrialUserFormValues = z.infer<typeof addTrialUserFormSchema>;

const USERS_PAGE_SIZE = 50;

// Sentinel value for the "no role" option in the optional (OpenCTI/OpenAEV)
// role dropdowns — Radix Select does not allow an empty-string item value.
const NO_ROLE_VALUE = 'none';

export const AddTrialUserForm = ({
  serviceInstanceId,
  products,
  onCompleted,
  onCancel,
}: AddTrialUserFormProps) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { me } = useContext(PortalContext);

  const bundleRolePanels = useMemo(
    () => getBundleRolePanels(products),
    [products]
  );

  const bundleUserServiceGroupsVariables = { serviceInstanceId };
  const { data: bundleUserServiceGroupsData } = useBundleUserServiceGroupsQuery(
    portalGraphqlClient,
    bundleUserServiceGroupsVariables,
    {
      queryKey: bundleUserServiceGroupsKeys.list(
        bundleUserServiceGroupsVariables
      ),
    }
  );

  const organizationId = me?.selected_organization_id;

  const usersVariables = {
    first: USERS_PAGE_SIZE,
    orderBy: UserOrdering.Email,
    orderMode: OrderingMode.Asc,
    filters: organizationId
      ? [{ key: FilterKey.OrganizationId, value: [organizationId] }]
      : [],
  };
  const { data: usersData } = useUsersQuery(
    portalGraphqlClient,
    usersVariables,
    {
      queryKey: usersKeys.list(usersVariables),
      enabled: !!organizationId,
    }
  );

  const existingUserIds = useMemo(
    () =>
      new Set(
        (bundleUserServiceGroupsData?.bundleUserServiceGroups ?? []).map(
          ({ user }) => user.id
        )
      ),
    [bundleUserServiceGroupsData]
  );

  const usersOptions = useMemo(
    () =>
      (usersData?.users.edges ?? [])
        .filter(({ node }) => !existingUserIds.has(node.id))
        .map(({ node }) => ({
          label: node.email,
          value: node.id,
        })),
    [usersData, existingUserIds]
  );

  const form = useForm<AddTrialUserFormValues>({
    resolver: zodResolver(addTrialUserFormSchema),
    defaultValues: {
      userIds: [],
      xtmoneRole: ServiceGroupName.User,
    },
  });

  const { mutate: addUsersToBundleGroups, isPending } =
    useAddUsersToBundleGroupsMutation(portalGraphqlClient, {
      onSuccess: (data) => {
        queryClient.setQueryData(
          bundleUserServiceGroupsKeys.list(bundleUserServiceGroupsVariables),
          { bundleUserServiceGroups: data.addUsersToBundleGroups }
        );
        toast({ title: t('Utils.Success') });
        onCompleted();
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'UnknownError';
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${errorMessage}`)}</>,
        });
      },
    });

  const onSubmit = (values: AddTrialUserFormValues) => {
    const roles = bundleRolePanels.flatMap(({ platform }) => {
      const fieldName: RoleFormField = `${platform}Role`;
      const role = values[fieldName];
      return role ? [{ product: platform, role }] : [];
    });

    addUsersToBundleGroups({
      serviceInstanceId,
      input: { userIds: values.userIds, roles },
    });
  };

  const userIds = useWatch({ control: form.control, name: 'userIds' });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-l"
        onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('Service.Bundle.ManageTrial.AddUserDialog.Email')}
              </FormLabel>
              <FormControl>
                <MultiSelectFormField
                  options={usersOptions}
                  defaultValue={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                  noResultString={t('Utils.NotFound')}
                  placeholder={t(
                    'Service.Bundle.ManageTrial.AddUserDialog.EmailPlaceholder'
                  )}
                  variant="inverted"
                  popoverContentClassName="bg-elevation-surface-highlight-layer-2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ManageTrialRoleDescriptions
          stacked
          products={products}
        />

        <div className="flex flex-col md:flex-row gap-l mt-l">
          {bundleRolePanels.map(({ platform, roles }) => {
            const fieldName: RoleFormField = `${platform}Role`;
            const namespace = `Service.Bundle.ManageTrial.Roles.${platform}`;
            const isOptional = platform !== PlatformIdentifier.Xtmone;
            const title = t(`${namespace}.Title`, { count: 1 });

            return (
              <FormField
                key={platform}
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  const value =
                    field.value ?? (isOptional ? NO_ROLE_VALUE : undefined);
                  const isNoAccessSelected = value === NO_ROLE_VALUE;

                  return (
                    <FormItem className="gap-m md:flex-1">
                      <FormLabel>{title}</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === NO_ROLE_VALUE ? undefined : value
                            )
                          }
                          value={value}>
                          <SelectTrigger
                            className={
                              isNoAccessSelected
                                ? 'bg-input-bg-default'
                                : 'bg-elevation-surface-highlight-layer-2'
                            }>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-elevation-surface-highlight-layer-2">
                            {isOptional && (
                              <SelectItem
                                value={NO_ROLE_VALUE}
                                className="bg-input-bg-default">
                                {t('Service.Bundle.ManageTrial.Roles.NoAccess')}
                              </SelectItem>
                            )}
                            {roles.map((role) => (
                              <SelectItem
                                key={role}
                                value={role}>
                                {t(`${namespace}.${role}.Label`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-s">
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}>
            {t('Utils.Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={userIds.length === 0 || isPending}>
            {t('Utils.Confirm')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
