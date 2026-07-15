'use client';

import { AddIcon, CloseIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

const PRODUCTS = [
  {
    label: 'OpenCTI',
    href: 'https://docs.opencti.io/latest/administration/hub/',
  },
  {
    label: 'OpenAEV',
    href: 'https://docs.openaev.io/latest/administration/hub/',
  },
];

const ConnectProductButton = () => {
  const t = useTranslations('PublicHomePage.XtmPlatform');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setOpen(true)}
        className={`w-53 flex items-center justify-between gap-s ${open ? 'invisible' : ''}`}>
        <span className="font-semibold">{t('Cta')}</span>
        <AddIcon className="size-3" />
      </Button>
      {open && (
        <div className="absolute top-0 left-0 border border-primary rounded-lg p-s flex flex-col gap-s w-53 bg-background z-10">
          <div className="flex items-center justify-between pl-s pr-xs pb-s">
            <span className="text-sm text-white">{t('Cta')}</span>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              className="h-5 w-5 p-0 shrink-0">
              <CloseIcon className="size-3" />
            </Button>
          </div>
          {PRODUCTS.map((product) => (
            <Button
              key={product.label}
              asChild
              className="w-full border-0 font-semibold">
              <Link
                href={product.href}
                target="_blank"
                rel="noopener noreferrer">
                {product.label}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectProductButton;
