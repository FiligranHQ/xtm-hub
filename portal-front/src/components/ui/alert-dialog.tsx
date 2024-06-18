import { FunctionComponent, ReactNode } from 'react';
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
} from 'filigran-ui/clients';
import { buttonVariants } from 'filigran-ui/servers';

interface AlertDialogProps {
  triggerElement: ReactNode;
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
            triggerElement={
              <Button
                variant="ghost"
                size="icon"
                aria-label="aria-description">
                My button trigger text.
              </Button>
            }
            onClickContinue={() => myCustomFunction(randomParam)}>
            Are you sure XXX ?
          </AlertDialogComponent>
 ```


 */
export const AlertDialogComponent: FunctionComponent<AlertDialogProps> = ({
  triggerElement,
  AlertTitle,
  description,
  actionButtonText = 'Continue',
  children,
  onClickContinue,
  variantName = 'default',
}) => {
  return (
    <AlertDialog>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClickContinue}
            className={buttonVariants({ variant: variantName })}>
            {actionButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
