'use client';
import { updateShareNumber } from '@/components/ui/share-link/share-link-actions';
import usePublicPath from '@/hooks/usePublicPath';
import { ShareIcon } from 'filigran-icon';
import {
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useCopyToClipboard } from 'usehooks-ts';

export interface ShareLinkButtonProps {
  url: string;
  documentId: string;
  tooltipText?: string;
}

export const shareLinkMutation = graphql`
  mutation shareLinkButtonMutation($documentId: ID!) {
    incrementShareNumberDocument(documentId: $documentId) {
      share_number
    }
  }
`;

export const ShareLinkButton: FunctionComponent<ShareLinkButtonProps> = (
  props
) => {
  const isPublicPath = usePublicPath();
  return isPublicPath ? (
    <ShareLinkServerAction {...props} />
  ) : (
    <ShareLinkClientButton {...props} />
  );
};

export const ShareLinkClientButton: FunctionComponent<ShareLinkButtonProps> = (
  props
) => {
  const [commitMutation] = useMutation(shareLinkMutation);

  return (
    <ShareLinkCommonButton
      {...props}
      onClickAction={() =>
        commitMutation({
          variables: {
            documentId: props.documentId,
          },
        })
      }
    />
  );
};

export const ShareLinkServerAction: FunctionComponent<ShareLinkButtonProps> = (
  props
) => {
  return (
    <ShareLinkCommonButton
      {...props}
      onClickAction={() => {
        updateShareNumber({
          variables: {
            documentId: props.documentId,
          },
        });
      }}
    />
  );
};

type ShareLinkCommonProps = ShareLinkButtonProps & {
  onClickAction: () => void;
};
export const ShareLinkCommonButton: FunctionComponent<ShareLinkCommonProps> = ({
  url,
  onClickAction,
  tooltipText,
}) => {
  const t = useTranslations();
  const [_, copy] = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    copy(url)
      .then(() => {
        onClickAction();
        toast({
          description: t('Service.ShareableResources.Copied'),
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
    <TooltipProvider>
      <Tooltip
        delayDuration={50}
        disableHoverableContent={true}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="z-[2] text-primary">
            <ShareIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {tooltipText
              ? t(tooltipText)
              : t('Service.ShareableResources.Share')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
