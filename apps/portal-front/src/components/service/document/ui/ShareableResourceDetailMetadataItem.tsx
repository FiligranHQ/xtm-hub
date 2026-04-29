import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { useTranslations } from 'next-intl';
import { ReactNode, useMemo } from 'react';
import { ShareableResourceDetailsLink } from '@/components/service/document/ShareableResourceDetailsLink';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/ShareableResourceDetailItem';

type Variant = 'text' | 'link';

interface Props {
  documentData: documentItem_fragment$data | publicDocumentItemFragment$data;
  metadataKey: string;
  translationKey: string;
  translationMetadata?: Record<string, string | number | Date>;
  variant?: Variant;
}

export const ShareableResourceDetailMetadataItem = ({
  documentData,
  metadataKey,
  translationKey,
  translationMetadata,
  variant = 'text',
}: Props) => {
  const t = useTranslations();
  const content = useMemo(() => {
    if (!docHasMetadata(documentData, metadataKey)) {
      return null;
    }

    const value = documentData[metadataKey] as string;

    const mapping: Record<Variant, ReactNode> = {
      link: <ShareableResourceDetailsLink url={value} />,
      text: <span>{value}</span>,
    };

    return mapping[variant];
  }, [variant, documentData, metadataKey]);

  if (!content) {
    return null;
  }

  return (
    <ShareableResourceDetailItem
      label={t(
        `Service.ShareableResources.Details.${translationKey}`,
        translationMetadata
      )}>
      {content}
    </ShareableResourceDetailItem>
  );
};
