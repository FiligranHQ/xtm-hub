import { FeatureFlag } from '@/utils/constant';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { LogoFiligranIcon } from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export const ServiceInstanceConnectorCard = async () => {
  const isConnectorsPageEnabled = await isFeatureEnabled(
    FeatureFlag.CONNECTORS_PAGE
  );
  const t = await getTranslations();

  const connectorServiceInstance = {
    name: t('Service.Connectors.Name'),
    slug: 'opencti-connectors',
    description: t('Service.Connectors.Description'),
    illustration_document: '/integrations_library.png',
    logo_document: '/octi_connectors.png',
  };

  const serviceHref = `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${connectorServiceInstance.slug}`;

  return (
    <>
      {isConnectorsPageEnabled && (
        <li
          key="Connector"
          className="relative border border-light rounded flex">
          <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
            <div className="flex relative justify-center items-center flex-col gap-s overflow-hidden box-border px-s bg-blue-900">
              <LogoFiligranIcon className="absolute text-white opacity-[0.03] z-1 size-60 rotate-45 -translate-x-24 -translate-y-12" />
              <div className="mt-s flex items-center h-12 w-full">
                <div
                  className="w-full h-12"
                  style={{
                    backgroundImage: `url(${connectorServiceInstance.logo_document})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'left center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
              <AspectRatio
                ratio={16 / 9}
                className="rounded-t overflow-hidden">
                <Image
                  fill
                  src={connectorServiceInstance.illustration_document}
                  objectPosition="top"
                  objectFit="cover"
                  alt={`Illustration of ${connectorServiceInstance.name}`}
                />
              </AspectRatio>
            </div>
            <div className="min-h-40 flex flex-col p-l gap-l flex-1 bg-page-background group-hover:bg-hover">
              <div className="flex items-start min-h-12 w-full text-ellipsis overflow-hidden">
                <Link
                  href={serviceHref}
                  className="focus-visible:outline-none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 z-0">
                  <h2>{connectorServiceInstance.name}</h2>
                </Link>
              </div>
              <p className="txt-sub-content text-muted-foreground">
                {connectorServiceInstance.description}
              </p>
            </div>
          </div>
        </li>
      )}
    </>
  );
};
