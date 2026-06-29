'use client';

import { CollapseMenuButton } from '@/components/menu/CollapseMenuButton';
import { LogoFiligranIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';

interface PublicMenuFooterProps {
  open: boolean;
  handleOpenMenu: () => void;
}

export const MenuFooter = ({ open, handleOpenMenu }: PublicMenuFooterProps) => {
  const t = useTranslations();

  return (
    <div>
      <CollapseMenuButton
        open={open}
        handleOpenMenu={handleOpenMenu}
        isHomepageV2={true}
      />
      {open ? (
        <div className="flex items-center px-m pb-s gap-1 text-muted-foreground/50 text-[10px] whitespace-nowrap">
          {t('App.MadeBy')}
          <LogoFiligranIcon className="min-h-4 size-3 shrink-0" />
          {/* eslint-disable-next-line xtm-hub-i18n-rules/no-literal-string-in-jsx */}
          {'Filigran'}
        </div>
      ) : (
        <div className="flex justify-center pb-s text-muted-foreground/50">
          <LogoFiligranIcon className="min-h-4 size-3" />
        </div>
      )}
    </div>
  );
};
