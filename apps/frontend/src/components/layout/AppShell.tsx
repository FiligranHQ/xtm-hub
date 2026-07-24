import { AppFooter } from '@/components/AppFooter';
import { SharedContent } from '@/components/layout/SharedContent';
import { ReactNode } from 'react';

interface AppShellProps {
  banners?: ReactNode;
  menu: ReactNode;
  headerContent: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

export const AppShell = ({
  banners,
  menu,
  headerContent,
  contentClassName,
  children,
}: AppShellProps) => {
  return (
    <div className="flex flex-col w-full h-dvh min-h-0">
      {banners}
      <div className="flex flex-row grow min-h-0">
        {menu}
        <div className="flex flex-col w-full h-full min-h-0 min-w-0">
          <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center border-b border-elevation-border-strong px-4 justify-between backdrop-blur-sm before:content-[''] before:absolute before:inset-0 before:bg-gradient-background before:opacity-50 before:-z-1">
            {headerContent}
          </header>
          <SharedContent className={contentClassName}>
            {children}
            <AppFooter
              isHomePageV2Enabled
              className="mt-auto max-md:mt-xxl mx-0"
            />
          </SharedContent>
        </div>
      </div>
    </div>
  );
};
