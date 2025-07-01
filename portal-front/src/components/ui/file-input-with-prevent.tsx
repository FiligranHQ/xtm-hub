'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

const FileInputWithPrevent = ({
  textSelectFile,
  allowedTypes,
  field,
}: {
  textSelectFile?: string;
  allowedTypes?: string;
  field: {
    onChange: (value: string) => void;
    name: string;
    value?: string;
  };
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    field.onChange(files);
    setIsOpen(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <AlertDialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button">{textSelectFile}</Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('Service.CustomDashboards.Form.UpdateJSONFile')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('Service.CustomDashboards.Form.DescriptionUpdateJSONFile')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('Utils.Cancel')}</AlertDialogCancel>
            <Button
              type="button"
              onClick={openFileDialog}>
              {t('Utils.Continue')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <input
        ref={inputRef}
        type="file"
        name={field.name}
        accept={allowedTypes}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default FileInputWithPrevent;
