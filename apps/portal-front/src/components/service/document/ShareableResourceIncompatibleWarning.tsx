import { CheckIndeterminateIcon } from '@filigran/icon';
import React from 'react';

interface Props {
  message: string;
}

export const ShareableResourceIncompatibleWarning: React.FC<Props> = ({
  message,
}) => {
  return (
    <div className="border border-solid border-orange rounded text-orange flex gap-xs p-s">
      <CheckIndeterminateIcon className="shrink-0 h-6 w-6" />
      {message}
    </div>
  );
};
