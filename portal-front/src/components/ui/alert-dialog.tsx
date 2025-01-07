import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  buttonVariants,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useState } from 'react';

interface AlertDialogProps {
  triggerElement?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  displayCancelButton?: boolean;
  AlertTitle: string;
  description?: string;
  actionButtonText?: string;
  children: ReactNode;
  onClickContinue: () => void;
  variantName?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined;
}

/*
Element that displays an alert dialog, with an action button and a cancel button.
Example of use :
```
 <AlertDialogComponent
            AlertTitle={'AlertDialog title, string'}
            variantName={"destructive"} /*optional
            actionButtonText={"Delete"} /*optional
            displayCancelButton={false} /*optional, default true
            triggerElement={
              <Button
                variant="ghost"
                size="icon"
                aria-label="aria-description">
                My button trigger text.
              </Button>
            } /* If you dont want to trigger it with triggerButton, you can choose open/isOpen option instead.
            onClickContinue={() => myCustomFunction(randomParam)}>
            Are you sure XXX ?
          </AlertDialogComponent>
 ```


 */
export const AlertDialogComponent: FunctionComponent<AlertDialogProps> = ({
  isOpen,
  onOpenChange,
  triggerElement,
  displayCancelButton = true,
  AlertTitle,
  description,
  actionButtonText = 'Continue',
  children,
  onClickContinue,
  variantName = 'default',
}) => {
  const t = useTranslations();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpened = isOpen ?? internalIsOpen;
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  return (
    <AlertDialog
      open={isOpened}
      onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{AlertTitle}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          {displayCancelButton && (
            <AlertDialogCancel onClick={() => handleOpenChange(false)}>
              {t('Utils.Cancel')}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => {
              onClickContinue();
              handleOpenChange(false);
            }}
            className={buttonVariants({ variant: variantName })}>
            {actionButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
