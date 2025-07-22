import * as React from 'react';

import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { octiInstancesQuery$data } from '@generated/octiInstancesQuery.graphql';
import { AutoForm, FormItem, FormLabel, FormMessage, Input } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

// Component interface
interface ChooseInstanceFormProps {
  documentData: ShareableResource;
  instancesOcti: octiInstancesQuery$data;
  oneClickDeploy: (octiInstanceUrl: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const selectOctiInstanceFormSchema = z.object({
  octiInstanceUrl: z.string().nonempty(),
});

// Component
const ChooseInstanceForm: React.FunctionComponent<ChooseInstanceFormProps> = ({
  documentData,
  instancesOcti,
  oneClickDeploy,
  setIsOpen,
}) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col h-full justify-between gap-m">
      <div className="space-y-m">
        <h1>
          {t('Service.ShareableResources.DeployOctiDescription', {
            dashboardName: documentData.name,
          })}
        </h1>
        <p>{t('Service.ShareableResources.DeployOctiQuestionTag')}</p>
      </div>
      <AutoForm
        formSchema={selectOctiInstanceFormSchema}
        onSubmit={({ octiInstanceUrl }) => {
          oneClickDeploy(octiInstanceUrl);
        }}
        fieldConfig={{
          octiInstanceUrl: {
            fieldType: ({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  {instancesOcti.octiInstances.map((instance) => (
                    <div
                      key={instance.url}
                      className="flex items-center gap-2">
                      <Input
                        id={instance.url}
                        type="radio"
                        onChange={() => field.onChange(instance.url)}
                        checked={field.value === instance.url}
                        value={instance.url}
                        className="h-6 w-6 accent-primary"
                      />
                      <FormLabel htmlFor={instance.url}>
                        {instance.title}
                      </FormLabel>
                    </div>
                  ))}
                </div>
                <FormMessage className="mt-2 text-sm text-destructive" />
              </FormItem>
            ),
          },
        }}>
        <div className="flex justify-end gap-s">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}>
            {t('Utils.Cancel')}
          </Button>

          <Button>{t('Utils.Continue')}</Button>
        </div>
      </AutoForm>
    </div>
  );
};

export default ChooseInstanceForm;
