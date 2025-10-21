import { getIngestionConnectorMetadata } from '@/components/connectors/connector.utils';
import { Contract } from '@/utils/connectors/connector.model';
import { LogoGitIcon, OpenInNewIcon } from 'filigran-icon';
import { Label } from 'filigran-ui/clients';
import { Badge, Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface ContractDetailsInformationPageProps {
  contract: Contract;
}

const ContractDetailsInformationPage = ({
  contract,
}: ContractDetailsInformationPageProps) => {
  const t = useTranslations();
  const connectorMetadata = getIngestionConnectorMetadata(
    contract.container_type
  );
  return (
    <div className="space-y-xl">
      <div>
        <Label className="block pb-s">
          {t('Service.Connectors.IntegrationDocumentationAndCode')}
        </Label>
        <Button
          className="p-0"
          variant="link"
          asChild>
          <Link
            href={contract.source_code}
            target="_blank">
            <LogoGitIcon className="h-4 w-4 mr-s" />
            {contract.title}
          </Link>
        </Button>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.Connectors.VisitVendor')}
        </Label>
        <Button
          className="p-0 uppercase"
          variant="link"
          asChild>
          <Link
            href={contract.subscription_link}
            rel="noopener noreferrer"
            target="_blank">
            <OpenInNewIcon className="h-4 w-4 mr-s" />
            {t('Service.Connectors.VendorContact')}
          </Link>
        </Button>
      </div>
      <div>
        <Label className="block pb-s">{t('Service.Connectors.Type')}</Label>
        <span>
          {connectorMetadata && (
            <Badge
              className="mr-auto"
              variant="outline"
              color={connectorMetadata.color}>
              {connectorMetadata.label}
            </Badge>
          )}
        </span>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.ShareableResources.Details.ProductVersion')}
        </Label>
        <span>{contract.support_version}</span>
      </div>

      {contract.last_verified_date && (
        <div>
          <Label className="block pb-s">
            {t('Service.Connectors.LastVerifiedDate')}
          </Label>
          <span>{contract.last_verified_date}</span>
        </div>
      )}
    </div>
  );
};

export default ContractDetailsInformationPage;
