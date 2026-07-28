import { ResourceStatusIcons } from '@/components/ui/ResourceStatusIcons';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCode, IntegrationType } from '@graphql/generated';

interface ShareableResourceCardIconProps {
  document: documentItem_fragment$data | PublicDocumentData;
  shouldDisplayBothIcons: boolean;
}

export const ShareableResourceCardIcon = ({
  document,
  shouldDisplayBothIcons,
}: ShareableResourceCardIconProps) => {
  const isConnector =
    docHasMetadata(document, DocumentMetadataKeyCode.IntegrationType) &&
    document.integration_type === IntegrationType.Connector;

  const deployable =
    document.active &&
    isConnector &&
    docHasMetadata(document, DocumentMetadataKeyCode.ManagerSupported) &&
    !!document.manager_supported;

  const verified =
    document.active &&
    isConnector &&
    docHasMetadata(document, DocumentMetadataKeyCode.Verified) &&
    !!document.verified;

  return (
    <div className="absolute top-m right-m flex gap-xs z-10">
      <ResourceStatusIcons
        deployable={deployable}
        verified={verified}
        active={!shouldDisplayBothIcons ? document.active : undefined}
        isConnector={isConnector}
      />
    </div>
  );
};
