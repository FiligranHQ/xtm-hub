'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useState,
} from 'react';

interface IconActionsProps {
  children: ReactNode;
  icon: ReactNode;
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
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <DropdownMenu
      open={menuOpen}
      onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
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
