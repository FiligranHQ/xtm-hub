import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';

export const Parameters = () => {
  const t = useTranslations();
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0-dev';

  return (
    <>
      <h1 className="pb-s"></h1>
      <div className="grid grid-cols-4">
        <Card className="w-1-3">
          <CardHeader>
            <CardTitle>XTM Hub</CardTitle>
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
    </>
  );
};
