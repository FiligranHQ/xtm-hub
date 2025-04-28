import {
  UserFragment,
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { FunctionComponent, useContext, useState } from 'react';

import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { PortalContext } from '@/components/me/app-portal-context';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { emailRegex } from '@/lib/regexs';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { serviceCapabilityMutation } from '@generated/serviceCapabilityMutation.graphql';
import { subscriptionByIdQuery$data } from '@generated/subscriptionByIdQuery.graphql';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import { userListQuery } from '@generated/userListQuery.graphql';
import { userServiceCreateMutation } from '@generated/userServiceCreateMutation.graphql';
import { userServices_fragment$data } from '@generated/userServices_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  readInlineData,
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

interface AddUserServiceFormProps {
  connectionId: string;
  userService?: userServices_fragment$data;
  subscription: subscriptionByIdQuery$data;
}

export const AddUserServiceForm: FunctionComponent<AddUserServiceFormProps> = ({
  connectionId,
  userService,
  subscription,
}) => {
  const { handleCloseSheet, setIsDirty, setOpenSheet } = useDialogContext();
  const { me } = useContext(PortalContext);

  const [commitServiceCapabilityMutation] =
    useMutation<serviceCapabilityMutation>(ServiceCapabilityCreateMutation);
  const [commitUserServiceMutation] = useMutation<userServiceCreateMutation>(
    UserServiceCreateMutation
  );
  const { toast } = useToast();
  const t = useTranslations();

  const genericCapabilities = [
    {
      id: GenericCapabilityName.ManageAccess as string,
      name: GenericCapabilityName.ManageAccess as string,
      description: GenericCapabilityName.ManageAccess as string,
    },
  ];

  const capabilitiesData = [
    ...(subscription.subscriptionById?.service_instance?.service_definition
      ?.service_capability ?? []),
    ...genericCapabilities,
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
  });

  const form = useForm({
    resolver: zodResolver(
      userService?.id ? capabilitiesFormSchema : extendedSchema
    ),
    defaultValues: {
      email: [{ id: '', text: '' }],
      capabilities: [],
      organizationId: subscription.subscriptionById?.organization?.id,
    },
  });
  setIsDirty(form.formState.isDirty);

  useEffect(() => {
    form.reset({
      email: [{ id: '', text: '' }],
      capabilities: [],
      organizationId: subscription.subscriptionById?.organization?.id,
    });
  }, [subscription.subscriptionById]);

  const onSubmitCapabilitiesSchema = (
    values: z.infer<typeof capabilitiesFormSchema>
  ) => {
    const editCapaValues = {
      capabilities: values.capabilities,
    };
    commitServiceCapabilityMutation({
      variables: {
        input: {
          user_service_id: userService?.id,

          ...editCapaValues,
        },
        serviceInstanceId: subscription.subscriptionById?.service_instance?.id,
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
        connections: [connectionId ?? ''],
        input: {
          email: values.email.map(({ text }) => text),
          capabilities: values.capabilities,
          subscriptionId: subscription.subscriptionById?.id ?? '',
        },
      },
      onCompleted() {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.UserServiceAdded', {
            email: values.email.map((item) => item.text).join(', '),
            serviceName: subscription.subscriptionById?.service_instance?.name,
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

  const onSubmit = userService?.id
    ? onSubmitCapabilitiesSchema
    : onSubmitExtendSchema;

  const { pageSize, orderMode, orderBy } = useUserListLocalstorage();

  const [filter, setFilter] = useState<{
    search?: string;
    organization?: string;
  }>({
    search: undefined,
    organization: subscription.subscriptionById?.organization?.id,
  });

  useEffect(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      organization: subscription.subscriptionById?.organization?.id,
    }));
  }, [subscription.subscriptionById]);

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
    searchTerm: filter.search,
    filters: filter.organization
      ? [{ key: 'organization_id', value: [filter.organization] }]
      : undefined,
  });

  const [data] = useRefetchableFragment<userListQuery, userList_users$key>(
    userListFragment,
    queryData
  );

  const isCapabilityDisabled = (id: string) => {
    if (id === GenericCapabilityName.ManageAccess) {
      return false;
    }

    return !subscription.subscriptionById?.subscription_capability?.some(
      (subscriptionCapa) => id === subscriptionCapa?.service_capability?.id
    );
  };

  const tagsAutocomplete = data?.users?.edges
    ?.filter((edge) => {
      const user = readInlineData<userList_fragment$key>(
        UserFragment,
        edge.node
      );
      return user.id !== me?.id;
    })
    ?.map((edge) => {
      const user = readInlineData<userList_fragment$key>(
        UserFragment,
        edge.node
      );
      return {
        id: user.id,
        text: user.email,
      };
    });
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
        {!userService?.id && (
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
          </>
        )}

        <div className="border border-primary rounded-lg p-l">
          <FormLabel>{t('OrganizationInServiceAction.SelectCapa')}</FormLabel>
          <p className="txt-sub-content italic">
            {t('InviteUserServiceForm.Description')}
          </p>
          {capabilitiesData.map((capability) => (
            <FormField
              key={capability!.id}
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      disabled={isCapabilityDisabled(capability!.id)}
                      className="mt-xs"
                      checked={(field.value as string[]).includes(
                        capability!.id
                      )}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? Array.from(
                              new Set([...(field.value || []), capability!.id])
                            )
                          : (field.value || []).filter(
                              (value) => value !== capability!.id
                            );
                        field.onChange(newValue);
                      }}
                      id={capability!.id}
                    />
                  </FormControl>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label
                          htmlFor={capability!.id}
                          className={`txt-sub-content ${!isCapabilityDisabled(capability!.id) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          {capability!.name ===
                          GenericCapabilityName.ManageAccess
                            ? 'Manage access: The user can invite other users from his/her organization to this service'
                            : `${capability!.name} access: ${capability!.description}`}
                          {isCapabilityDisabled(capability!.id)}
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isCapabilityDisabled(capability!.id)
                            ? t('InviteUserServiceForm.DisabledCapability')
                            : t('InviteUserServiceForm.GrantCapability')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
          <Button type="submit">{t('Utils.Validate')}</Button>
        </SheetFooter>
      </form>
    </Form>
  );
};
