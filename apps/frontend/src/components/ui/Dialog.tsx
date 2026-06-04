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
  title: string;
  description?: string;
  children: ReactNode;
}

export const DialogInformative = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}: DialogInformativeProps) => {
  const t = useTranslations();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent>
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
              variant="secondary"
              onClick={onClose}>
              {t('Utils.Close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
