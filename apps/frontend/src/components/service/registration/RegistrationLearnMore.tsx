'use server';
import PublicServiceInstanceCard from '@/components/service/PublicServiceInstanceCard';
import { cn } from '@/lib/utils';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import ServiceLinksByTagsQueryGraphql, {
  serviceLinksByTagsQuery,
} from '@generated/serviceLinksByTagsQuery.graphql';
import { ServiceInstanceTag } from '@graphql/generated';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import React from 'react';

const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn('flex flex-col gap-xxl py-20', className)}>
    {children}
  </section>
);

interface RegistrationLearnMoreProps {
  serviceInstanceTag: ServiceInstanceTag;
}

export const RegistrationLearnMore = async ({
  serviceInstanceTag,
}: RegistrationLearnMoreProps) => {
  const response = await serverFetchGraphQL<serviceLinksByTagsQuery>(
    ServiceLinksByTagsQueryGraphql,
    {
      tags: [ServiceInstanceTag.Trial, serviceInstanceTag],
    },
    { cache: undefined, next: { revalidate: 3600 } }
  );

  const services = response.data
    .serviceInstanceLinksByTags as unknown as seoServiceInstanceFragment$data[];
  const t = await getTranslations();
  const platformName =
    serviceInstanceTag === ServiceInstanceTag.OpenCti ? 'OpenCTI' : 'OpenAEV';

  return (
    <>
      <Section className="bg-blue-800/5 px-xl">
        <div className="text-center w-[70%] m-auto">
          <h2 className="text-primary text-2xl mb-l">
            {t('Service_Trials_XTMPlatform_Title')}
          </h2>
          <p>{t('Service_Trials_XTMPlatform_Description', { platformName })}</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-xl">
          <div className="flex flex-col gap-s basis-full">
            <div className="rounded p-6 basis-full bg-elevation-background-layer-1">
              <h3 className="mb-m flex gap-s">
                <Image
                  width="25"
                  height="25"
                  src="/logo_opencti_dark.png"
                  alt={t('Service_Trials_XTMPlatform_LogoAlt', {
                    name: t('PlatformIdentifier_opencti'),
                  })}
                />
                {t('PlatformIdentifier_opencti')}
              </h3>
              <p className="mb-s">
                <strong>
                  {t('Service_Trials_XTMPlatform_OpenCTITagline')}
                </strong>
              </p>
              <p>{t('Service_Trials_XTMPlatform_OpenCTIDescription')}</p>
            </div>
            <div className="rounded p-6 basis-full bg-elevation-background-layer-1">
              <h3 className="mb-m flex gap-s">
                <Image
                  width="25"
                  height="25"
                  src="/logo_openaev_dark.png"
                  alt={t('Service_Trials_XTMPlatform_LogoAlt', {
                    name: t('PlatformIdentifier_openaev'),
                  })}
                />
                {t('PlatformIdentifier_openaev')}
              </h3>
              <p className="mb-s">
                <strong>
                  {t('Service_Trials_XTMPlatform_OpenAEVTagline')}
                </strong>
              </p>
              <p>{t('Service_Trials_XTMPlatform_OpenAEVDescription')}</p>
            </div>
          </div>
          <div className="basis-full m-auto">
            <Image
              width="1232"
              height="692"
              src={
                serviceInstanceTag === ServiceInstanceTag.OpenCti
                  ? `/opencti_ecosystem.png`
                  : '/openaev_ecosystem.png'
              }
              priority={false}
              loading="lazy"
              alt={t('Service_Trials_XTMPlatform_IllustrationAlt')}
              className="rounded w-full"
            />
          </div>
        </div>
      </Section>
      <Section>
        <div className="flex flex-col lg:flex-row items-center gap-xl">
          <div className="basis-full flex justify-between gap-l max-sm:flex-col">
            {services.map((service) => (
              <PublicServiceInstanceCard
                key={service.id}
                className="basis-full max-w-[50%] max-sm:max-w-none"
                serviceInstance={seoServiceInstanceToInstanceCardData(
                  service,
                  t
                )}
              />
            ))}
          </div>
          <div className="order-first text-sm lg:order-last basis-full">
            <h2 className="text-primary text-2xl mb-l">
              {t('Service_Trials_QuickStart_Title')}
            </h2>
            <p className="mb-l">
              {t('Service_Trials_QuickStart_Subtitle', { platformName })}
            </p>
            <p>{t('Service_Trials_QuickStart_Description')}</p>
          </div>
        </div>
      </Section>
    </>
  );
};
