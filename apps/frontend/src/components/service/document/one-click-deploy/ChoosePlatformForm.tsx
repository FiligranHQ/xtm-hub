import {
  useDeployResourceTitle,
  useIncompatibleVersionMessage,
} from '@/components/service/document/one-click-deploy/use-deploy-resource-title';
import { AutoForm } from '@/components/ui/auto-form';
import { FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { useTranslate } from '@/hooks/use-translate';
import { isEeCapableContract } from '@/utils/platform';
import { doesVersionSatisfy } from '@/utils/versioning';
import { Button, Radio, RadioGroup } from '@filigran/design-system';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useRegisteredPlatformsFragment$data } from '@generated/useRegisteredPlatformsFragment.graphql';
import { z } from 'zod';

interface ChoosePlatformFormProps {
  documentData: documentItem_fragment$data;
  platforms: useRegisteredPlatformsFragment$data[];
  translatedPlatformIdentifier: string;
  oneClickDeploy: (platformUrl: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  requiredProductVersion?: string | null;
  requiresEe?: boolean;
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
  requiredProductVersion,
  requiresEe,
}: ChoosePlatformFormProps) => {
  const t = useTranslate();
  const title = useDeployResourceTitle(documentData);
  const incompatibleVersionMessage =
    useIncompatibleVersionMessage(documentData);
  const deployQuestion = t(
    'Service.ShareableResources.Deploy.DeployQuestionTag',
    { platformType: translatedPlatformIdentifier }
  );

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="space-y-3">
        <h1>{title}</h1>
        <p>{deployQuestion}</p>
      </div>
      <AutoForm
        formSchema={selectPlatformFormSchema}
        onSubmit={({ platformUrl }) => {
          setIsOpen(false);
          oneClickDeploy(platformUrl);
        }}
        fieldConfig={{
          platformUrl: {
            fieldType: ({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    aria-label={deployQuestion}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}>
                    {platforms.map((platform) => {
                      const isPlatformCompatible = doesVersionSatisfy({
                        givenVersion: platform.version ?? '0.0.0',
                        requiredVersion: requiredProductVersion ?? '0.0.0',
                      });

                      const isEeBlocked =
                        requiresEe && !isEeCapableContract(platform.contract);
                      const isDisabled = !isPlatformCompatible || isEeBlocked;
                      const reason = isEeBlocked
                        ? t(
                            'Service.ShareableResources.Deploy.EE.PlatformRequiresEE',
                            { platformTitle: platform.title }
                          )
                        : !isPlatformCompatible
                          ? incompatibleVersionMessage(
                              platform.title,
                              requiredProductVersion ?? ''
                            )
                          : undefined;

                      return (
                        <Radio
                          key={platform.id}
                          id={platform.id}
                          value={platform.url}
                          disabled={isDisabled}
                          label={platform.title}
                          description={reason}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage className="mt-2" />
              </FormItem>
            ),
          },
        }}>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            priority="secondary"
            onClick={() => {
              setIsOpen(false);
            }}>
            {t('Utils.Cancel')}
          </Button>

          <Button type="submit">{t('Utils.Continue')}</Button>
        </div>
      </AutoForm>
    </div>
  );
};

export default ChoosePlatformForm;
