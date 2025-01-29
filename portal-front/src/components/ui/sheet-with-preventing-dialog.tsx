import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from 'react';

interface UserFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  onOpenAutoFocus?: (event: Event) => void;
}

interface DialogContextProps {
  handleCloseSheet: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setIsDirty: (isDirty: boolean) => void;
  setOpenSheet: (open: boolean) => void;
}
const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

export const SheetWithPreventingDialog: FunctionComponent<
  UserFormSheetProps
> = ({
  open,
  setOpen,
  trigger,
  title,
  description = '',
  children,
  onOpenAutoFocus,
}) => {
  const t = useTranslations();
  const [openDialog, setOpenDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const alertDialogSheetClose = (
    e: Event | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (isDirty) {
      e.preventDefault();
      setOpenDialog(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <Sheet
        key={'right'}
        open={open}
        onOpenChange={setOpen}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side={'right'}
          onInteractOutside={(e) => alertDialogSheetClose(e)}
          onOpenAutoFocus={onOpenAutoFocus}>
          <SheetHeader className="bg-page-background">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <DialogContext.Provider
            value={{
              handleCloseSheet: alertDialogSheetClose,
              setIsDirty,
              setOpenSheet: setOpen,
            }}>
            {children}
          </DialogContext.Provider>
        </SheetContent>
      </Sheet>
      <AlertDialogComponent
        AlertTitle={t('DialogActions.ContinueTitle')}
        actionButtonText={t('MenuActions.Continue')}
        variantName={'destructive'}
        isOpen={openDialog}
        onOpenChange={setOpenDialog}
        onClickContinue={() => setOpen(false)}>
        {t('DialogActions.ContinueSentence')}
      </AlertDialogComponent>
    </>
  );
};
