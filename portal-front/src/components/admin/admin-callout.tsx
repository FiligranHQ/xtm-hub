import { useTranslations } from 'next-intl';
import { Callout } from '../ui/callout';

export function AdminCallout() {
  const t = useTranslations();

  return (
    <Callout
      variant="warning"
      className="mb-s">
      {t('AdminCallout')}
    </Callout>
  );
}
