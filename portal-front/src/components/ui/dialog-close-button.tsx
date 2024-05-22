import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'filigran-ui/clients';
import { FunctionComponent, ReactNode } from 'react';
import { Button } from 'filigran-ui/servers';

interface DialogCloseButtonProps {
  trigger: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export const DialogCloseButton: FunctionComponent<DialogCloseButtonProps> = ({
  trigger,
  title,
  description,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">{trigger}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button
              className="mt-2"
              type="button"
              variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
