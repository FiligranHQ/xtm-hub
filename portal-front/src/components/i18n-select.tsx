'use client';

import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { CheckIcon, LanguageIcon } from 'filigran-icon';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { useLocale, useTranslations } from 'next-intl';

export default function I18nSelect() {
  const t = useTranslations();
  const defaultValue = useLocale();

  const items = [
    {
      value: 'en',
      label: t('LocaleSwitcher.en'),
    },
    {
      value: 'fr',
      label: t('LocaleSwitcher.fr'),
    },
  ];
  function onChange(value: string) {
    const locale = value as Locale;
    setUserLocale(locale);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('LocaleSwitcher.Label')}
          variant="ghost"
          size="icon"
          className="w-9 px-0">
          <LanguageIcon
            aria-hidden={true}
            focusable={false}
            className="h-4 w-4"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => onChange(item.value)}>
            <div className="mr-2 w-[1rem]">
              {item.value === defaultValue && <CheckIcon className="h-4 w-4" />}
            </div>
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
