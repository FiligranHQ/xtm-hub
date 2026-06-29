import { ResourceStatusIcons } from '@/components/ui/ResourceStatusIcons';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';

interface ShareableResourceCardIconProps {
  document: documentItem_fragment$data | PublicDocumentData;
  shouldDisplayBothIcons: boolean;
}

export const ShareableResourceCardIcon = ({
  document,
  shouldDisplayBothIcons,
}: ShareableResourceCardIconProps) => {
  const deployable =
    document.active &&
    shouldDisplayBothIcons &&
    docHasMetadata(document, DocumentMetadataKeyCodeEnum.MANAGER_SUPPORTED) &&
    !!document.manager_supported;

  const verified =
    document.active &&
    shouldDisplayBothIcons &&
    docHasMetadata(document, DocumentMetadataKeyCodeEnum.VERIFIED) &&
    !!document.verified;

  return (
    <div className="absolute top-m right-m flex gap-xs z-10">
      <ResourceStatusIcons
        deployable={deployable}
        verified={verified}
        active={!shouldDisplayBothIcons ? document.active : undefined}
      />
    </div>
  );
};
