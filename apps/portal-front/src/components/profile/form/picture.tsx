'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@filigran/ui';
import { EditIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';
import React, { useContext, useRef, useState } from 'react';

interface ProfileFormPictureProps {
  onSubmit: (files: FileList) => void;
}

export const ProfileFormPicture: React.FC<ProfileFormPictureProps> = ({
  onSubmit,
}) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(selectedFile);
      onSubmit(dataTransfer.files);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ProfilePage.Picture')}</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/gif, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          className="flex flex-col items-start cursor-pointer"
          onClick={() => inputRef.current?.click()}>
          <div className="size-24">
            <Avatar src={preview || me?.picture || undefined} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost-primary"
          size="sm"
          className="ml-m gap-s"
          onClick={() => inputRef.current?.click()}>
          <EditIcon className="h-4 w-4" />
          <span>{t('ProfilePage.Edit')}</span>
        </Button>
        <Button
          aria-label={t('Utils.Update')}
          onClick={handleSubmit}>
          {t('Utils.Update')}
        </Button>
      </CardFooter>
    </Card>
  );
};