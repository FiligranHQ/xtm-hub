'use client';

import { useTheme } from 'next-themes';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t('ThemeToggle.ToggleTheme')}
          className="w-9 px-0">
          <SunIcon
            aria-hidden={true}
            focusable={false}
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            aria-hidden={true}
            focusable={false}
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          aria-label={t('ThemeToggle.SetTheme')}
          onClick={() => setTheme('light')}>
          {t('ThemeToggle.Light')}
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-label={t('ThemeToggle.SetTheme')}
          onClick={() => setTheme('dark')}>
          {t('ThemeToggle.Dark')}
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-label={t('ThemeToggle.SetTheme')}
          onClick={() => setTheme('system')}>
          {t('ThemeToggle.Automatic')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
