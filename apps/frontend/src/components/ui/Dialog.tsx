import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface DialogInformativeProps {
  isOpen: boolean;
  onClose: () => void;
  onButtonClick?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'secondary';
  buttonText?: string;
}

export const DialogInformative = ({
  isOpen,
  onClose,
  onButtonClick,
  title,
  description,
  children,
  variant = 'secondary',
  buttonText = 'Utils.Close',
}: DialogInformativeProps) => {
  const t = useTranslations();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}>
      <DialogContent>
        <DialogHeader className={'gap-s'}>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="whitespace-pre-line">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button
              className="mt-2 hover:cursor-pointer"
              type="button"
              variant={variant}
              onClick={onButtonClick ?? onClose}>
              {t(buttonText)}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
