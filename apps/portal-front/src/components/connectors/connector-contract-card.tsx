'use client';
import {
  getBadgesValues,
  IngestionConnectorType,
  ingestionConnectorTypeMetadata,
} from '@/components/connectors/connector.utils';
import BadgeOverflowCounter from '@/components/ui/badge-overflow-counter';
import { Contract } from '@/utils/connectors/connector.model';
import { VerifiedIcon } from 'filigran-icon';
import { Badge } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent } from 'react';

interface ConnectorContractCardProps {
  contract: Contract;
  version?: string;
}

const ConnectorContractCard: FunctionComponent<ConnectorContractCardProps> = ({
  contract,
}) => {
  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background hover:bg-hover">
      <Link
        className="flex flex-col h-full"
        href={`/cybersecurity-solutions/opencti-connectors/${contract.slug}`}>
        <div className="flex items-stretch gap-l p-l relative">
          <div className="w-24 self-stretch flex">
            <Image
              src={contract.logo}
              alt={`${contract.title} logo`}
              width={96}
              height={96}
              loading="lazy"
              className="rounded object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 pr-xxl">
                {contract.title}
              </h2>
              {contract.verified && (
                <VerifiedIcon className="absolute top-l right-l h-6 w-6 shrink-0 text-green-500" />
              )}
            </div>
            <div className="mt-s flex flex-wrap gap-s mb-xs">
              <BadgeOverflowCounter
                badges={getBadgesValues(contract)}
                className="z-[2]"
              />
            </div>
          </div>
        </div>
        <p className="p-l text-gray-300 text-sm">
          {contract.short_description}
        </p>
        <div className="flex items-center justify-end mt-auto p-l">
          {ingestionConnectorTypeMetadata[
            contract.container_type as IngestionConnectorType
          ] && (
            <Badge
              className="mr-auto"
              variant="outline"
              color={
                ingestionConnectorTypeMetadata[
                  contract.container_type as IngestionConnectorType
                ]?.color
              }>
              {
                ingestionConnectorTypeMetadata[
                  contract.container_type as IngestionConnectorType
                ]?.label
              }
            </Badge>
          )}
        </div>
      </Link>
    </li>
  );
};

export default ConnectorContractCard;
