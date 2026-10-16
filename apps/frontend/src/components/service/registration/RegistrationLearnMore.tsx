'use server';
import PublicServiceInstanceCard from '@/components/service/PublicServiceInstanceCard';
import { getTranslate } from '@/hooks/get-translate';
import { cn } from '@/lib/utils';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/utils/constant';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import ServiceLinksByTagsQueryGraphql, {
  serviceLinksByTagsQuery,
} from '@generated/serviceLinksByTagsQuery.graphql';
import { ServiceInstanceTag } from '@graphql/generated';
import Image from 'next/image';
import React from 'react';

const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn('flex flex-col gap-8 py-20', className)}>
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
    { cache: undefined, next: { revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS } }
  );

  const services = response.data
    .serviceInstanceLinksByTags as unknown as seoServiceInstanceFragment$data[];
  const t = await getTranslate();
  const platformName =
    serviceInstanceTag === ServiceInstanceTag.OpenCti ? 'OpenCTI' : 'OpenAEV';

  return (
    <>
      <Section className="bg-filigran-brand-primary-transparency-10 px-6">
        <div className="text-center w-[70%] m-auto">
          <h2 className="text-filigran-brand-primary text-2xl mb-4">
            {t('Service.Trials.XTMPlatform.Title')}
          </h2>
          <p>{t('Service.Trials.XTMPlatform.Description', { platformName })}</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-2 basis-full">
            <div className="rounded p-6 basis-full layer-1 bg-elevation-default">
              <h3 className="mb-3 flex gap-2">
                <Image
                  width="25"
                  height="25"
                  src="/logo_opencti_dark.png"
                  alt={t('Service.Trials.XTMPlatform.LogoAlt', {
                    name: t('PlatformIdentifier.opencti'),
                  })}
                />
                {t('PlatformIdentifier.opencti')}
              </h3>
              <p className="mb-2">
                <strong>
                  {t('Service.Trials.XTMPlatform.OpenCTITagline')}
                </strong>
              </p>
              <p>{t('Service.Trials.XTMPlatform.OpenCTIDescription')}</p>
            </div>
            <div className="rounded p-6 basis-full layer-1 bg-elevation-default">
              <h3 className="mb-3 flex gap-2">
                <Image
                  width="25"
                  height="25"
                  src="/logo_openaev_dark.png"
                  alt={t('Service.Trials.XTMPlatform.LogoAlt', {
                    name: t('PlatformIdentifier.openaev'),
                  })}
                />
                {t('PlatformIdentifier.openaev')}
              </h3>
              <p className="mb-2">
                <strong>
                  {t('Service.Trials.XTMPlatform.OpenAEVTagline')}
                </strong>
              </p>
              <p>{t('Service.Trials.XTMPlatform.OpenAEVDescription')}</p>
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
              loading="lazy"
              alt={t('Service.Trials.XTMPlatform.IllustrationAlt')}
              className="rounded w-full"
            />
          </div>
        </div>
      </Section>
      <Section>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="basis-full flex justify-between gap-4 max-sm:flex-col">
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
            <h2 className="text-filigran-brand-primary text-2xl mb-4">
              {t('Service.Trials.QuickStart.Title')}
            </h2>
            <p className="mb-4">
              {t('Service.Trials.QuickStart.Subtitle', { platformName })}
            </p>
            <p>{t('Service.Trials.QuickStart.Description')}</p>
          </div>
        </div>
      </Section>
    </>
  );
};
