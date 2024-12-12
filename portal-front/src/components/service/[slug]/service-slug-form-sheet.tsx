import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { Portal, portalContext } from '@/components/portal-context';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { UnknownIcon } from 'filigran-icon';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
} from 'filigran-ui/clients';
import { Button, MultiSelectFormField } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useLazyLoadQuery,
  useMutation,
  useRefetchableFragment,
} from 'react-relay';
import { z } from 'zod';
import { serviceCapabilityMutation } from '../../../../__generated__/serviceCapabilityMutation.graphql';
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
  subscriptionId: string;
}

const capabilitiesFormSchema = z.object({
  capabilities: z.array(z.string()),
});

export const ServiceSlugFormSheet: FunctionComponent<
  ServiceSlugFormSheetProps
> = ({ open, setOpen, trigger, connectionId, userService, subscriptionId }) => {
  const [commitServiceCapabilityMutation] =
    useMutation<serviceCapabilityMutation>(ServiceCapabilityCreateMutation);
  const [commitUserServiceMutation] = useMutation<userServiceCreateMutation>(
    UserServiceCreateMutation
  );
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

  // Schéma étendu
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

  // Utilisation de `useForm`
  const form = useForm({
    resolver: zodResolver(
      !userService.id ? extendedSchema : capabilitiesFormSchema
    ),
    defaultValues: {
      email: [{ id: '', text: '' }],
      capabilities: currentCapabilities,
    },
  });

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
            title: 'Success',
            description: `${userService.user.email} ${t('Utils.Modified')}`,
          });
        },
        onError(error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
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
            subscriptionId: subscriptionId,
          },
        },
        onCompleted() {
          toast({
            title: 'Success',
            description: `${values.email[0].text} ${t('Utils.Modified')}`,
          });
        },
        onError(error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
          });
        },
      });
    }
    setOpen(false);
  };

  const { pageSize, orderMode, orderBy } = useUserListLocalstorage();

  const [filter, setFilter] = useState<UserFilter>({
    search: undefined,
    organization: me?.selected_organization_id,
  });
  const handleInputChange = (inputValue: string) => {
    setFilter((prevFilter) => {
      const updatedFilter = {
        ...prevFilter,
        search: inputValue,
      };
      refetch({ filter: updatedFilter });
      return updatedFilter;
    });
  };
  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: pageSize,
    orderMode: orderMode,
    orderBy: orderBy,
    filter,
  });
  const [data, refetch] = useRefetchableFragment<
    userListQuery,
    userList_users$key
  >(userListFragment, queryData);

  const tagsAutocomplete = data?.users?.edges?.map((edge) => ({
    id: edge.node.id,
    text: edge.node.email,
  }));
  const { setValue } = form;

  const [tags, setTags] = useState<Tag[]>([]);

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>{'Invite user to the service'}</SheetTitle>
          <SheetDescription>
            {'Set the access rights here. Click Validate when you are done.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="space-y-xl"
            onSubmit={form.handleSubmit(onSubmit)}>
            {userService.id ? (
              <></>
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <TagInput
                        {...field}
                        placeholder={t('Service.Management.Email')}
                        tags={tags}
                        activeTagIndex={0}
                        setActiveTagIndex={() => {}}
                        enableAutocomplete={true}
                        autocompleteOptions={tagsAutocomplete}
                        maxTags={1}
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
            )}
            <FormField
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capabilities</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={capabilitiesData}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select capabilities"
                      variant="inverted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-2">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                Validate
              </Button>
            </SheetFooter>
            <div className="flex flex-row">
              <div className="font-bold">Manage access</div>{' '}
              <div className="flex items-center">
                <UnknownIcon className="h-4 w-4 ml-s" />{' '}
              </div>
            </div>
            You can access the service and invite users to this service
            <div className="flex flex-row">
              <div className="font-bold">Access service</div>
              <div className="flex items-center">
                <UnknownIcon className="h-4 w-4 ml-s" />
              </div>
            </div>
            You just have access to a service
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
