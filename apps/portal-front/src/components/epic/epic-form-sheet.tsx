'use client';
import EpicForm from '@/components/epic/epic-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { Button } from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface EpicFormSheetProps {
  epic?: epic_fragment$data;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  triggerElement?: React.ReactNode;
}

export const EpicFormSheet = ({
  epic,
  open: externalOpen,
  setOpen: externalSetOpen,
  triggerElement,
}: EpicFormSheetProps) => {
  const t = useTranslations();
  const [internalOpenSheet, setInternalOpenSheet] = useState(false);

  const openSheet =
    externalOpen !== undefined ? externalOpen : internalOpenSheet;
  const setOpenSheet =
    externalSetOpen !== undefined ? externalSetOpen : setInternalOpenSheet;

  return (
    <SheetWithPreventingDialog
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={
        triggerElement || (
          <Button className="ml-auto">
            {t(epic ? 'Utils.Update' : 'Utils.Create')}
          </Button>
        )
      }
      title={t(
        epic ? 'Epic.EpicActions.UpdateEpic' : 'Epic.EpicActions.CreateEpic'
      )}>
      <EpicForm
        epic={epic}
        onClose={() => setOpenSheet(false)}
      />
    </SheetWithPreventingDialog>
  );
};
