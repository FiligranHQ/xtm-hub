import { Button, SheetFooter } from '@filigran/ui';
import { useTranslations } from 'next-intl';

interface Props {
  handleCloseSheet: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ServiceFormSheetFooter = ({ handleCloseSheet }: Props) => {
  const t = useTranslations();
  return (
    <SheetFooter className="sm:justify-between pt-2">
      <div className="ml-auto flex gap-s">
        <Button
          variant="outline"
          type="button"
          onClick={(e) => handleCloseSheet(e)}>
          {t('Utils.Cancel')}
        </Button>

        <Button>{t('Utils.Validate')}</Button>
      </div>
    </SheetFooter>
  );
};
