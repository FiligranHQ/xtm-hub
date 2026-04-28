'use client';

import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { SettingsContext } from '../../settings/EnvPortalContext';

export const ProfileFormPreferences: React.FC = () => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const isDevelopmentEnvSetting =
    settings?.environment && settings.environment !== 'production';
  const locale = useLocale();
  const { theme, setTheme } = useTheme();

  const onLocaleChange = (value: string) => {
    void setUserLocale(value as Locale);
  };

  const currentTheme = theme ?? 'dark';

  if (!isDevelopmentEnvSetting) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ProfilePage.Preferences.Title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-l">
        <div className="grid gap-s">
          <span className="txt-default">
            {t('ProfilePage.Preferences.Theme')}
          </span>
          <Select
            value={currentTheme}
            onValueChange={setTheme}>
            <SelectTrigger aria-label={t('ThemeToggle.SetTheme')}>
              <SelectValue placeholder={t('ThemeToggle.SetTheme')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('ThemeToggle.Light')}</SelectItem>
              <SelectItem value="dark">{t('ThemeToggle.Dark')}</SelectItem>
              <SelectItem value="system">
                {t('ThemeToggle.Automatic')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-s">
          <span className="txt-default">
            {t('ProfilePage.Preferences.Language')}
          </span>
          <Select
            value={locale}
            onValueChange={onLocaleChange}>
            <SelectTrigger aria-label={t('LocaleSwitcher.Label')}>
              <SelectValue placeholder={t('LocaleSwitcher.Label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('LocaleSwitcher.en')}</SelectItem>
              <SelectItem value="fr">{t('LocaleSwitcher.fr')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
