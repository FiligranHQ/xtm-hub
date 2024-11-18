import { DisplayLogo } from '@/components/ui/display-logo';

export const MenuLogo = () => {
  return (
    <div className="flex flex-shrink-0 sticky top-0 h-16 border-border-light border-b bg-page-background items-center px-l">
      <DisplayLogo className="w-[10rem] absolute" />
    </div>
  );
};
