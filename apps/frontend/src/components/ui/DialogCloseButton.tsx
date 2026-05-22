import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface DialogCloseButtonProps {
  trigger: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export const DialogCloseButton = ({
  trigger,
  title,
  description,
  children,
}: DialogCloseButtonProps) => {
  const t = useTranslations();
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
              {t('Utils.Close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
