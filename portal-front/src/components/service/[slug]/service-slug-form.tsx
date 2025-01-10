import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { ServiceDescribeCapabilitiesSheet } from '@/components/service/[slug]/service-describe-capabilities';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import { emailRegex } from '@/lib/regexs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Combobox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  MultiSelectFormField,
  SheetFooter,
  Tag,
  TagInput,
  useToast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';
import { z } from 'zod';
import { serviceCapabilityMutation } from '../../../../__generated__/serviceCapabilityMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '../../../../__generated__/subscriptionWithUserService_fragment.graphql';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import {
  UserFilter,
  userListQuery,
} from '../../../../__generated__/userListQuery.graphql';
import { userServiceCreateMutation } from '../../../../__generated__/userServiceCreateMutation.graphql';

interface ServiceSlugFormSheetProps {
  connectionId: string;
  userService: any;
  subscription: subscriptionWithUserService_fragment$data;
  dataOrganizationsTab: {
    value: string;
    label: string;
  }[];
}

export const ServiceSlugForm: FunctionComponent<ServiceSlugFormSheetProps> = ({
  connectionId,
  userService,
  subscription,
  dataOrganizationsTab,
}) => {
  const { handleCloseSheet, setIsDirty, setOpenSheet } = useDialogContext();
  const [commitServiceCapabilityMutation] =
    useMutation<serviceCapabilityMutation>(ServiceCapabilityCreateMutation);
  const [commitUserServiceMutation] = useMutation<userServiceCreateMutation>(
    UserServiceCreateMutation
  );
  const { slug } = useDecodedParams();
  const { toast } = useToast();
  const t = useTranslations();

  const currentCapabilities = userService?.service_capability?.map(
    (capability: any) => capability?.service_capability_name
  );

  const capabilitiesData = [
    {
      label: 'MANAGE_ACCESS',
      value: 'MANAGE_ACCESS',
    },
    {
      label: 'ACCESS_SERVICE',
      value: 'ACCESS_SERVICE',
    },
  ];

  const capabilitiesFormSchema = z.object({
    capabilities: z.array(z.string()),
  });

  const extendedSchema = capabilitiesFormSchema.extend({
    email: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
        })
      )
      .min(1, { message: 'Please provide at least one email.' }),
    organizationId: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(
      !userService.id ? extendedSchema : capabilitiesFormSchema
    ),
    defaultValues: {
      email: [{ id: '', text: '' }],
      capabilities: currentCapabilities,
      organizationId: subscription?.organization?.id,
    },
  });
  setIsDirty(form.formState.isDirty);

  useEffect(() => {
    form.reset({
      email: [{ id: '', text: '' }],
      capabilities: currentCapabilities,
      organizationId: subscription?.organization?.id,
    });
  }, [subscription]);

  const onSubmit = (values: any) => {
    if (userService.id) {
      const editCapaValues = {
        capabilities: values.capabilities,
      };
      commitServiceCapabilityMutation({
        variables: {
          input: { user_service_id: userService?.id, ...editCapaValues },
        },
        onCompleted() {
          toast({
            title: t('Utils.Success'),
            description: t('ServiceActions.UserCapabilitiesModified', {
              email: userService.user.email,
            }),
          });
          setOpenSheet(false);
        },
        onError(error) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t(`Error.Server.${error.message}`),
          });
        },
      });
    } else {
      commitUserServiceMutation({
        variables: {
          connections: [connectionId],
          input: {
            email: values.email[0].text,
            capabilities: values.capabilities,
            serviceId: slug ?? '',
            organizationId: values.organizationId,
          },
        },
        onCompleted() {
          toast({
            title: t('Utils.Success'),
            description: `${values.email[0].text} ${t('Utils.Modified')}`,
          });
          setOpenSheet(false);
        },

        onError(error) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: <>{t(`Error.Server.${error.message}`)}</>,
          });
        },
      });
    }
  };

  const { pageSize, orderMode, orderBy } = useUserListLocalstorage();

  const [filter, setFilter] = useState<UserFilter>({
    search: undefined,
    organization: subscription?.organization?.id,
  });

  useEffect(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      organization: subscription?.organization?.id,
    }));
  }, [subscription]);

  let filterTimeout: NodeJS.Timeout;
  const handleInputChange = (inputValue: string) => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      setFilter((prevFilter) => ({
        ...prevFilter,
        search: inputValue,
      }));
    }, 400);
  };
  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: pageSize,
    orderMode,
    orderBy,
    filter,
  });
  const [data] = useRefetchableFragment<userListQuery, userList_users$key>(
    userListFragment,
    queryData
  );

  const tagsAutocomplete = data?.users?.edges?.map((edge) => ({
    id: edge.node.id,
    text: edge.node.email,
  }));
  const { setValue } = form;

  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <Form {...form}>
      <form
        className="space-y-xl"
        onSubmit={form.handleSubmit(onSubmit)}>
        {!userService.id && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>={t('InviteUserServiceForm.Email')}</FormLabel>
                  <FormControl>
                    <TagInput
                      {...field}
                      placeholder={t('Service.Management.Email')}
                      tags={tags}
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                      enableAutocomplete={true}
                      autocompleteOptions={tagsAutocomplete}
                      maxTags={1}
                      validateTag={(tag: string) => !!tag.match(emailRegex)}
                      placeholderWhenFull={t('Service.Management.OneUserMax')}
                      setTags={(newTags) => {
                        setTags(newTags);
                        setValue('email', newTags as Tag[]);
                      }}
                      onInputChange={handleInputChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('InviteUserServiceForm.Organization')}
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      dataTab={dataOrganizationsTab}
                      order={t(
                        'OrganizationInServiceAction.SelectOrganization'
                      )}
                      placeholder={t(
                        'OrganizationInServiceAction.SelectOrganization'
                      )}
                      emptyCommand={t('Utils.NotFound')}
                      onValueChange={field.onChange}
                      value={field.value}
                      onInputChange={() => {}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="capabilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('InviteUserServiceForm.Capabilities')}</FormLabel>
              <FormControl>
                <MultiSelectFormField
                  noResultString={t('Utils.NotFound')}
                  options={capabilitiesData}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t(
                    'InviteUserServiceForm.CapabilitiesPlaceholder'
                  )}
                  variant="inverted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={(e) => handleCloseSheet(e)}>
            {t('Utils.Cancel')}
          </Button>
          <Button
            disabled={!form.formState.isDirty}
            type="submit">
            {t('Utils.Validate')}
          </Button>
        </SheetFooter>
        <ServiceDescribeCapabilitiesSheet />
      </form>
    </Form>
  );
};
