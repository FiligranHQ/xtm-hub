import { DisplayLogo } from '@/components/ui/display-logo';

export const MenuLogo = () => {
  return (
    <div className="flex z-10 flex-shrink-0 sticky top-0 h-16 border-border-light border-b bg-page-background dark:bg-background items-center px-m">
      <DisplayLogo className="w-[10rem] absolute" />
    </div>
  );
};
