import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from '@filigran/ui';
import { FeatureFlag } from '@graphql/generated';
import { useTranslations } from 'next-intl';

export const Parameters = () => {
  const t = useTranslations();
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlag.HomePageV2);
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0-dev';

  return (
    <div
      className={
        isHomePageV2Enabled
          ? 'grid grid-cols-1 sm:grid-cols-3'
          : 'grid grid-cols-3'
      }>
      <Card className="w-1-3">
        <CardHeader>
          <CardTitle className="heading-lg">{t('App.Title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b py-2">
              <Label>{t('Parameters.Version')}</Label>
              <div>
                <Badge>{appVersion}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
