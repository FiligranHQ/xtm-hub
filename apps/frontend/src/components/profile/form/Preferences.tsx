'use client';
import { MeEditUserMutation } from '@/components/me/me.graphql';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { Locale, locales, publicLocales } from '@/i18n/config';
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
import { useTheme } from 'next-themes';
import { useContext } from 'react';
import { useMutation } from 'react-relay';

import { useTolgee, useTranslate } from '@tolgee/react';

export const ProfileFormPreferences = () => {
  const { t } = useTranslate();
  const { settings } = useContext(SettingsContext);
  const isDevelopmentEnvSetting = settings?.environment === 'development';
  const { language: locale } = useTolgee(['language']);
  const { theme, setTheme } = useTheme();
  const [commitEditMeUserMutation] = useMutation(MeEditUserMutation);
  const availableLocales = isDevelopmentEnvSetting ? locales : publicLocales;

  const onLocaleChange = (value: string) => {
    void setUserLocale(value as Locale);
    commitEditMeUserMutation({ variables: { selected_language: value } });
  };

  const currentTheme = theme ?? 'dark';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-lg">
          {t('ProfilePage_Preferences_Title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-l">
        <div className="grid gap-s">
          <span className="txt-default">
            {t('ProfilePage_Preferences_Theme')}
          </span>
          <Select
            value={currentTheme}
            onValueChange={setTheme}>
            <SelectTrigger aria-label={t('ThemeToggle_SetTheme')}>
              <SelectValue placeholder={t('ThemeToggle_SetTheme')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('ThemeToggle_Light')}</SelectItem>
              <SelectItem value="dark">{t('ThemeToggle_Dark')}</SelectItem>
              <SelectItem value="system">
                {t('ThemeToggle_Automatic')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-s">
          <span className="txt-default">
            {t('ProfilePage_Preferences_Language')}
          </span>
          <Select
            value={locale}
            onValueChange={onLocaleChange}>
            <SelectTrigger aria-label={t('LocaleSwitcher_Label')}>
              <SelectValue placeholder={t('LocaleSwitcher_Label')} />
            </SelectTrigger>
            <SelectContent>
              {availableLocales.map((loc) => (
                <SelectItem
                  key={loc}
                  value={loc}>
                  {t(`LocaleSwitcher_${loc}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
