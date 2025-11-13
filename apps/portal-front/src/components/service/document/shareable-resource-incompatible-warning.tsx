import { CheckIndeterminateIcon } from 'filigran-icon';
import React from 'react';

interface Props {
  message: string;
}

export const ShareableResourceIncompatibleWarning: React.FC<Props> = ({
  message,
}) => {
  return (
    <div className="border border-solid border-orange rounded text-orange flex items-start gap-xs p-s max-w-xs">
      <CheckIndeterminateIcon className="h-8 w-8" />
      {message}
    </div>
  );
};
