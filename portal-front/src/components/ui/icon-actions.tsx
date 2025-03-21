'use client';
import { cn } from '@/lib/utils';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'filigran-ui';
import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useState,
} from 'react';

interface IconActionsProps {
  children: ReactNode;
  icon: ReactNode;
  className?: string;
}

interface IconActionContextProps {
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IconActionContext = createContext<IconActionContextProps>({
  setMenuOpen: () => {},
});
export const IconActions: FunctionComponent<IconActionsProps> = ({
  children,
  icon,
  className,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <DropdownMenu
      open={menuOpen}
      onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex h-8 w-8 p-0 data-[state=open]:bg-muted',
            className
          )}>
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px]">
        <IconActionContext.Provider value={{ setMenuOpen }}>
          {children}
        </IconActionContext.Provider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const IconActionsButton: FunctionComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => {
  return (
    <Button
      variant="ghost"
      className={cn('w-full justify-start normal-case', className)}
      onClick={(e) => e.stopPropagation()}
      {...props}>
      {children}
    </Button>
  );
};
