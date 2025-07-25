import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { oneClickDeployOctiPlatformFragment$data } from '@generated/oneClickDeployOctiPlatformFragment.graphql';
import { AutoForm, FormItem, FormLabel, FormMessage, Input } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

interface ChoosePlatformFormProps {
  documentData: ShareableResource;
  platformsOcti: oneClickDeployOctiPlatformFragment$data[];
  oneClickDeploy: (octiPlatformUrl: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const selectOctiPlatformFormSchema = z.object({
  octiPlatformUrl: z.string().nonempty(),
});

const ChoosePlatformForm = ({
  documentData,
  platformsOcti,
  oneClickDeploy,
  setIsOpen,
}: ChoosePlatformFormProps) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col h-full justify-between gap-m">
      <div className="space-y-m">
        <h1>
          {t(
            'Service.ShareableResources.Deploy.DeployDashboardOctiDescription',
            {
              dashboardName: documentData.name,
            }
          )}
        </h1>
        <p>{t('Service.ShareableResources.Deploy.DeployOctiQuestionTag')}</p>
      </div>
      <AutoForm
        formSchema={selectOctiPlatformFormSchema}
        onSubmit={({ octiPlatformUrl }) => {
          oneClickDeploy(octiPlatformUrl);
        }}
        fieldConfig={{
          octiPlatformUrl: {
            fieldType: ({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  {platformsOcti.map((platform) => (
                    <div
                      key={platform.url}
                      className="flex items-center gap-2">
                      <Input
                        id={platform.url}
                        type="radio"
                        onChange={() => field.onChange(platform.url)}
                        checked={field.value === platform.url}
                        value={platform.url}
                        className="h-6 w-6 accent-primary"
                      />
                      <FormLabel htmlFor={platform.url}>
                        {platform.title}
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
            type="button"
            variant="outline"
            onClick={() => {
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

export default ChoosePlatformForm;
