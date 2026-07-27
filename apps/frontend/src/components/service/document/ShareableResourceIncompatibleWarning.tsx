import { CheckIndeterminateIcon } from '@filigran/icon';

interface ShareableResourceIncompatibleWarningProps {
  message: string;
}

export const ShareableResourceIncompatibleWarning = ({
  message,
}: ShareableResourceIncompatibleWarningProps) => {
  return (
    <div className="border border-solid border-orange rounded text-feedback-warning-primary flex gap-xs p-s">
      <CheckIndeterminateIcon className="shrink-0 h-6 w-6" />
      {message}
    </div>
  );
};
