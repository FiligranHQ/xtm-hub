import { FunctionComponent, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from 'filigran-ui/clients';

interface AlertDialogProps {
  triggerElement: ReactNode;
  AlertTitle: string;
  description?: string;
  children: ReactNode;
  onClickContinue: () => void;
}

/*
Element that displays an alert dialog, with an action button and a cancel button.
Example of use :
```
 <AlertDialogComponent
            AlertTitle={'AlertDialog title, string'}
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
  children,
  onClickContinue,
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
          <AlertDialogAction onClick={onClickContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
