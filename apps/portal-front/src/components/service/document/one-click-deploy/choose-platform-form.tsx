import { SHAREABLE_RESOURCE_TYPE_NAME_MAPPING } from '@/components/service/document/shareable-resource-slug';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { oneClickDeployPlatformFragment$data } from '@generated/oneClickDeployPlatformFragment.graphql';
import { AutoForm, FormItem, FormLabel, FormMessage, Input } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

interface ChoosePlatformFormProps {
  documentData: ShareableResource;
  platforms: oneClickDeployPlatformFragment$data[];
  translatedPlatformIdentifier: string;
  oneClickDeploy: (platformUrl: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const selectPlatformFormSchema = z.object({
  platformUrl: z.string().nonempty(),
});

const ChoosePlatformForm = ({
  documentData,
  platforms,
  translatedPlatformIdentifier,
  oneClickDeploy,
  setIsOpen,
}: ChoosePlatformFormProps) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col h-full justify-between gap-m">
      <div className="space-y-m">
        <h1>
          {t('Service.ShareableResources.Deploy.DeployResourceDescription', {
            resourceName: documentData.name,
            resourceType:
              SHAREABLE_RESOURCE_TYPE_NAME_MAPPING[
                documentData.type as keyof typeof SHAREABLE_RESOURCE_TYPE_NAME_MAPPING
              ],
          })}
        </h1>
        <p>
          {t('Service.ShareableResources.Deploy.DeployQuestionTag', {
            platformType: translatedPlatformIdentifier,
          })}
        </p>
      </div>
      <AutoForm
        formSchema={selectPlatformFormSchema}
        onSubmit={({ platformUrl }) => {
          oneClickDeploy(platformUrl);
        }}
        fieldConfig={{
          platformUrl: {
            fieldType: ({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  {platforms.map((platform) => (
                    <div
                      key={platform.url}
                      className="flex items-center gap-2">
                      <Input
                        id={platform.url}
                        type="radio"
                        onChange={() => field.onChange(platform.url)}
                        checked={field.value === platform.url}
                        value={platform.url}
                        className="h-4 w-4 accent-primary"
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

          <Button
            onClick={() => {
              setIsOpen(false);
            }}>
            {t('Utils.Continue')}
          </Button>
        </div>
      </AutoForm>
    </div>
  );
};

export default ChoosePlatformForm;
