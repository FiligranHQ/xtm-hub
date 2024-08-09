import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import { z, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Combobox,
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { getOrganizations } from '@/components/organization/organization.service';
import { communityFormSchema } from '@/components/service/community/community-form-schema';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { userQuery } from '../../../../__generated__/userQuery.graphql';
import {
  UserListQuery,
  usersFragment,
} from '@/components/admin/user/user.graphql';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import GuardCapacityComponent from '@/components/admin-guard';

interface CommunityFormSheetProps {
  queryRef: PreloadedQuery<userQuery>;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: string;
  handleSubmit: (values: z.infer<typeof communityFormSchema>) => void;
  validationSchema: ZodSchema;
}

export const CommunityFormSheet: FunctionComponent<CommunityFormSheetProps> = ({
  queryRef,
  open,
  setOpen,
  trigger,
  title,
  description,
  handleSubmit,
  validationSchema,
}) => {
  const [selectedValue, setSelectedValue] = React.useState('acef');

  const availableServicesList = ['OpenFeed', 'NextCloud', 'OpenCTI'];

  const servicesData = availableServicesList?.map((service) => {
    return {
      label: service,
      value: service,
    };
  });

  const [organizations] = getOrganizations();
  const organizationsData =
    organizations.organizations.edges.map(({ node }) => ({
      label: node.name,
      value: node.id,
    })) ?? [];

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    handleSubmit({
      ...values,
    });
  };

  const queryData = usePreloadedQuery<userQuery>(UserListQuery, queryRef);
  const [data, refetch] = useRefetchableFragment<userQuery, userList_users$key>(
    usersFragment,
    queryData
  );

  const usersData = data.users.edges.map((user) => {
    return {
      value: user.node?.email ?? '',
      label: user.node?.email ?? '',
    };
  });

  const handleInputChange = (inputValue: string) => {
    refetch({
      filter: inputValue,
    });
  };

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-8">
            <FormField
              control={form.control}
              name="community_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Community name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="community_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short description here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <GuardCapacityComponent
              displayError={false}
              capacityRestriction={['BYPASS']}>
              <FormField
                control={form.control}
                name="billing_manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community billing manager</FormLabel>
                    <FormControl>
                      <div>
                        <Combobox
                          dataTab={usersData}
                          order={'Choose'}
                          placeholder={'Choose an email'}
                          emptyCommand={'Not found'}
                          onInputChange={handleInputChange}
                          value={selectedValue}
                          onValueChange={(value) => {
                            setSelectedValue(value);
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a fee type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          key={'MONTHLY'}
                          value={'MONTHLY'}>
                          {'MONTHLY'}
                        </SelectItem>
                        <SelectItem
                          key={'YEARLY'}
                          value={'YEARLY'}>
                          {'YEARLY'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GuardCapacityComponent>
            <FormField
              control={form.control}
              name="organizations_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizations</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={organizationsData}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select organizations"
                      variant="inverted"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basic_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services wanted</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={servicesData}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select services"
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
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};