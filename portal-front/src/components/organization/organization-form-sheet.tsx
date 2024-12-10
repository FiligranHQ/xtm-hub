import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tag,
  TagInput,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';

interface OrganizationFormSheetProps {
  organization?: organizationItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  handleSubmit: (values: z.infer<typeof organizationFormSchema>) => void;
}

export const OrganizationFormSheet: FunctionComponent<
  OrganizationFormSheetProps
> = ({ organization, open, setOpen, trigger, title, handleSubmit }) => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name ?? '',
      domains: (organization?.domains as string[]) ?? [],
    },
  });
  useEffect(
    () =>
      form.reset({
        name: organization?.name ?? '',
        domains: (organization?.domains as string[]) ?? [],
      }),
    [organization, form]
  );
  const onSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    handleSubmit({
      ...values,
    });
  };

  const { setValue } = form;
  const [tags, setTags] = useState<Tag[]>(
    (organization?.domains ?? []).map(
      (domain) => ({ id: domain, text: domain }) as Tag
    )
  );
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="w-full space-y-xl"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domains"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Domains</FormLabel>
                  <FormControl>
                    <TagInput
                      {...field}
                      placeholder="Enter a domain"
                      tags={tags}
                      className="sm:min-w-[450px]"
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                      setTags={(newTags) => {
                        const newTagsText: string[] = (newTags as Tag[]).map(
                          (tag) => tag.text
                        );
                        setTags(newTags);
                        setValue('domains', newTagsText, {
                          shouldDirty: true,
                        });
                      }}
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
