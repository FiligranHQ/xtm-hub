'use client';
import { ShareIcon } from 'filigran-icon';
import { toast } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

export const ShareLinkButton: FunctionComponent<{ url: string }> = ({
  url,
}) => {
  const t = useTranslations();
  const [_, copy] = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    copy(url)
      .then(() => {
        toast({
          title: t('Utils.Copied'),
        });
      })
      .catch((error) => {
        toast({
          title: t('Utils.FailedToCopy'),
          description: error.message,
        });
      });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="z-[2]">
      <ShareIcon className="h-4 w-4" />
    </Button>
  );
};
