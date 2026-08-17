'use client';
import { PortalContext } from '@/components/me/AppPortalContext';
import { EditIcon } from '@filigran/icon';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@filigran/ui';
import React, { useContext, useRef, useState } from 'react';

import { useTranslate } from '@tolgee/react';
interface ProfileFormPictureProps {
  onSubmit: (files: (File | null)[]) => void;
}

export const ProfileFormPicture = ({ onSubmit }: ProfileFormPictureProps) => {
  const { t } = useTranslate();
  const { me } = useContext(PortalContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) {
        // If there is already a preview, we need to revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(preview);
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      if (preview) {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(preview);
      }
      onSubmit([selectedFile]);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-lg">{t('ProfilePage_Picture')}</CardTitle>
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
          className="size-24 cursor-pointer [&_img]:object-cover"
          onClick={() => inputRef.current?.click()}>
          <Avatar src={preview || me?.picture || undefined} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="tertiary"
          aria-label={t('Utils_Edit')}
          size="sm"
          className="ml-s gap-s"
          onClick={() => inputRef.current?.click()}>
          <EditIcon className="h-4 w-4" />
          <span>{t('Utils_Edit')}</span>
        </Button>
        <Button
          aria-label={t('ProfilePage_UpdatePicture')}
          onClick={handleSubmit}>
          {t('Utils_Update')}
        </Button>
      </CardFooter>
    </Card>
  );
};
