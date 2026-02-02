import { UserFragment } from '@/components/admin/user/user-list';
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { PortalContext } from '@/components/me/app-portal-context';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { useUsersList } from '@/hooks/useUsersList';
import { emailRegex } from '@/lib/regexs';
import { DEBOUNCE_TIME } from '@/utils/constant';
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
} from '@filigran/ui';
import { serviceCapabilityMutation } from '@generated/serviceCapabilityMutation.graphql';
import { subscriptionByIdQuery$data } from '@generated/subscriptionByIdQuery.graphql';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { userServiceCreateMutation } from '@generated/userServiceCreateMutation.graphql';
import { userServices_fragment$data } from '@generated/userServices_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { readInlineData, useMutation } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';
import { z } from 'zod';

interface UserServiceFormProps {
  connectionId: string;
  userService?: userServices_fragment$data;
  subscription: subscriptionByIdQuery$data;
}

export const UserServiceForm: FunctionComponent<UserServiceFormProps> = ({
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
  const isUserCreation = !userService?.id;

  const organizationId = subscription.subscriptionById?.organization?.id;
  const genericCapabilities = [
    {
      id: GenericCapabilityName.MANAGE_ACCESS as string,
      name: GenericCapabilityName.MANAGE_ACCESS as string,
      description: GenericCapabilityName.MANAGE_ACCESS as string,
    },
  ];

  const capabilitiesData = [
    ...(subscription.subscriptionById?.service_instance?.service_definition
      ?.service_capability ?? []),
    ...genericCapabilities,
  ];

  const capabilitiesFormSchema = z.object({
    capabilities: z.array(z.string()),
    organizationId: z.string(),
  });

  const extendedSchema = capabilitiesFormSchema.extend({
    email: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
        })
      )
      .min(1, {
        error: 'Please provide at least one email.',
      }),
  });

  const currentCapabilities = useMemo(() => {
    if (isUserCreation) {
      return [];
    }

    return userService?.user_service_capability
      ?.map((capability) => {
        return (
          capability?.generic_service_capability?.name ||
          capability?.subscription_capability?.service_capability?.id
        );
      })
      .filter((id) => id !== undefined);
  }, [isUserCreation, userService]);

  const defaultValues = useMemo(() => {
    return {
      email: [{ id: '', text: '' }],
      capabilities: currentCapabilities,
      organizationId: organizationId,
    };
  }, [organizationId, currentCapabilities]);

  const capabilitiesForm = useForm<z.infer<typeof capabilitiesFormSchema>>({
    resolver: zodResolver(capabilitiesFormSchema),
    defaultValues: {
      capabilities: currentCapabilities,
      organizationId: organizationId,
    },
  });

  const extendedForm = useForm<z.infer<typeof extendedSchema>>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      email: [{ id: '', text: '' }],
      capabilities: currentCapabilities,
      organizationId: organizationId,
    },
  });

  const form = userService?.id ? capabilitiesForm : extendedForm;

  useEffect(() => {
    form.reset(defaultValues);
  }, [subscription.subscriptionById?.id, defaultValues]);

  useEffect(() => {
    setIsDirty(form.formState.isDirty);
  }, [form.formState.isDirty]);

  const onSubmitCapabilitiesSchema = (
    values: z.infer<typeof capabilitiesFormSchema>
  ) => {
    const editCapaValues = {
      capabilities: values.capabilities,
    };
    commitServiceCapabilityMutation({
      variables: {
        input: {
          user_service_id: userService!.id,

          ...editCapaValues,
        },
        serviceInstanceId: subscription.subscriptionById?.service_instance?.id,
      },
      onCompleted() {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.UserCapabilitiesModified', {
            email: userService!.user!.email,
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
            serviceName: subscription.subscriptionById!.service_instance!.name,
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

  const { pageSize, orderMode, orderBy } = useUserListLocalstorage();
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const filter = useMemo(
    () => ({
      search: searchTerm,
      organization: organizationId,
    }),
    [searchTerm, organizationId]
  );

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
  };

  const debounceHandleInput = useDebounceCallback(
    handleInputChange,
    DEBOUNCE_TIME
  );

  const isCapabilityDisabled = (id: string) => {
    if (id === GenericCapabilityName.MANAGE_ACCESS) {
      return false;
    }

    return !subscription.subscriptionById?.subscription_capability?.some(
      (subscriptionCapa) => id === subscriptionCapa?.service_capability?.id
    );
  };

  const { data } = useUsersList({ pageSize, orderMode, orderBy, filter });

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

  const { setValue } = extendedForm;
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <Form {...(form as typeof extendedForm)}>
      <form
        className="space-y-xl"
        onSubmit={(e) => {
          e.preventDefault();
          userService?.id
            ? capabilitiesForm.handleSubmit(onSubmitCapabilitiesSchema)(e)
            : extendedForm.handleSubmit(onSubmitExtendSchema)(e);
        }}>
        {!userService?.id && (
          <>
            <FormField
              control={extendedForm.control}
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
              control={(form as typeof capabilitiesForm).control}
              name="capabilities"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      {...field}
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
                          aria-disabled={isCapabilityDisabled(capability!.id)}
                          className="txt-sub-content cursor-pointer aria-disabled:cursor-not-allowed">
                          {capability!.name ===
                          GenericCapabilityName.MANAGE_ACCESS
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
