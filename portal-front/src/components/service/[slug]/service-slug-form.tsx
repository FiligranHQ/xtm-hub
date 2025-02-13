import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import useDecodedParams from '@/hooks/useDecodedParams';
import { emailRegex } from '@/lib/regexs';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { serviceCapabilityMutation } from '@generated/serviceCapabilityMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import { UserFilter, userListQuery } from '@generated/userListQuery.graphql';
import { userService_fragment$data } from '@generated/userService_fragment.graphql';
import { userServiceCreateMutation } from '@generated/userServiceCreateMutation.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Combobox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SheetFooter,
  Tag,
  TagInput,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';
import { serviceCapability_fragment$data } from '../../../../__generated__/serviceCapability_fragment.graphql';

interface ServiceSlugFormSheetProps {
  connectionId: string;
  userService: userService_fragment$data;
  subscription: subscriptionWithUserService_fragment$data;
  serviceName: string;
  serviceCapabilities: serviceCapability_fragment$data[];
  dataOrganizationsTab: {
    value: string;
    label: string;
  }[];
}

export const ServiceSlugForm: FunctionComponent<ServiceSlugFormSheetProps> = ({
  connectionId,
  userService,
  subscription,
  serviceName,
  serviceCapabilities,
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

  const genericCapabilities = [
    {
      id: GenericCapabilityName.ManageAccess as string,
      name: GenericCapabilityName.ManageAccess as string,
      description: GenericCapabilityName.ManageAccess as string,
    },
  ];

  const capabilitiesData = [...serviceCapabilities, ...genericCapabilities];

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
      capabilities: [],
      organizationId: subscription?.organization?.id,
    },
  });
  setIsDirty(form.formState.isDirty);

  useEffect(() => {
    form.reset({
      email: [{ id: '', text: '' }],
      capabilities: [],
      organizationId: subscription?.organization?.id,
    });
  }, [subscription]);

  const onSubmitCapabilitiesSchema = (
    values: z.infer<typeof capabilitiesFormSchema>
  ) => {
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
            email: userService?.user?.email,
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
  };

  const onSubmitExtendSchema = (values: z.infer<typeof extendedSchema>) => {
    commitUserServiceMutation({
      variables: {
        connections: [connectionId],
        input: {
          email: values.email.map(({ text }) => text),
          capabilities: values.capabilities,
          serviceInstanceId: slug ?? '',
          organizationId: values.organizationId,
        },
      },
      onCompleted() {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.UserServiceAdded', {
            email: values.email.map((item) => item.text).join(', '),
            serviceName: serviceName,
          }),
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
  };

  const onSubmit = !userService.id
    ? onSubmitExtendSchema
    : onSubmitCapabilitiesSchema;

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

  const handleInputChange = (inputValue: string) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      search: inputValue,
    }));
  };

  const debounceHandleInput = useDebounceCallback(
    handleInputChange,
    DEBOUNCE_TIME
  );

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
  const isAdminPath = useAdminPath();
  const isCapabilityDisabled = (id: string) => {
    if (id === GenericCapabilityName.ManageAccess) {
      return false;
    }
    return !subscription.subscription_capability?.some(
      (subscriptionCapa) => id === subscriptionCapa?.service_capability?.id
    );
  };

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
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}>
        {!userService.id && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('InviteUserServiceForm.Email')}</FormLabel>
                  <FormControl>
                    <TagInput
                      {...field}
                      placeholder={t('Service.Management.Email')}
                      tags={tags}
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                      enableAutocomplete={true}
                      autocompleteOptions={tagsAutocomplete}
                      validateTag={(tag: string) => !!tag.match(emailRegex)}
                      setTags={(newTags) => {
                        setTags(newTags);
                        setValue('email', newTags as Tag[]);
                      }}
                      onInputChange={debounceHandleInput}
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

        <div className="border border-primary rounded-lg p-l">
          <FormLabel>{t('OrganizationInServiceAction.SelectCapa')}</FormLabel>
          <p className="txt-sub-content italic">
            {t('InviteUserServiceForm.Description')}
          </p>
          {capabilitiesData.map(({ id, name, description }) => (
            <FormField
              key={id}
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  {(isAdminPath || !isCapabilityDisabled(id)) && (
                    <FormControl>
                      <Checkbox
                        disabled={isCapabilityDisabled(id)}
                        className="mt-xs"
                        checked={(field.value as string[]).includes(id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? Array.from(new Set([...(field.value || []), id]))
                            : (field.value || []).filter(
                                (value) => value !== id
                              );
                          field.onChange(newValue);
                        }}
                        id={id}
                      />
                    </FormControl>
                  )}

                  {(isAdminPath || !isCapabilityDisabled(id)) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label
                            htmlFor={id}
                            className={`txt-sub-content ${!isCapabilityDisabled(id) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            {name === GenericCapabilityName.ManageAccess
                              ? 'Manage access: The user can invite other users from his/her organization to this service'
                              : `${name} access: ${description}`}
                            {isCapabilityDisabled(id)}
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {isCapabilityDisabled(id)
                              ? t('InviteUserServiceForm.DisabledCapability')
                              : t('InviteUserServiceForm.GrantCapability')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </FormItem>
              )}
            />
          ))}
        </div>

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
      </form>
    </Form>
  );
};
