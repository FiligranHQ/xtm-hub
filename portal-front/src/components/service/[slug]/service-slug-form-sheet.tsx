import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { Portal, portalContext } from '@/components/portal-context';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { ServiceDescribeCapabilitiesSheet } from '@/components/service/[slug]/service-describe-capabilities';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tag,
  TagInput,
  useToast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
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
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  connectionId: string;
  userService: any;
  subscription: subscriptionWithUserService_fragment$data;
  dataOrganizationsTab: {
    value: string;
    label: string;
  }[];
}

export const ServiceSlugFormSheet: FunctionComponent<
  ServiceSlugFormSheetProps
> = ({
  open,
  setOpen,
  trigger,
  connectionId,
  userService,
  subscription,
  dataOrganizationsTab,
}) => {
  const [commitServiceCapabilityMutation] =
    useMutation<serviceCapabilityMutation>(ServiceCapabilityCreateMutation);
  const [commitUserServiceMutation] = useMutation<userServiceCreateMutation>(
    UserServiceCreateMutation
  );
  const { slug } = useDecodedParams();
  const { me } = useContext<Portal>(portalContext);
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
    setOpen(false);
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
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>
            {t('Service.Management.InviteUser.InviteUser')}
          </SheetTitle>
          <SheetDescription>
            {t('Service.Management.InviteUser.InviteUserSubtitle')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="space-y-xl"
            onSubmit={form.handleSubmit(onSubmit)}>
            {userService.id ? (
              <></>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Service.Management.Email')}</FormLabel>
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
                          placeholderWhenFull={t(
                            'Service.Management.OneUserMax'
                          )}
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
                        {t('Service.Management.InviteUser.Organization')}
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
                  <FormLabel>
                    {t('Service.Capabilities.CapabilitiesTitle')}
                  </FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      noResultString={t('Utils.NotFound')}
                      options={capabilitiesData}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('Service.Capabilities.SelectCapabilities')}
                      variant="inverted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-2">
              <SheetClose asChild>
                <Button variant="outline">{t('Utils.Cancel')}</Button>
              </SheetClose>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                {t('Utils.Validate')}
              </Button>
            </SheetFooter>
            <ServiceDescribeCapabilitiesSheet />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
