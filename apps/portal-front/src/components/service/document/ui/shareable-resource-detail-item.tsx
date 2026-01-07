import { Label } from '@filigran/ui/clients';
import React from 'react';

interface Props {
  label: string;
  children: React.ReactNode;
}

export const ShareableResourceDetailItem: React.FC<Props> = ({
  label,
  children,
}) => {
  return (
    <div>
      <Label className="block pb-s">{label}</Label>
      {children}
    </div>
  );
};
