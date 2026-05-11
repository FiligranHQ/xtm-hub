'use server';
import ServiceInstanceCard from '@/components/service/ServiceInstanceCard';
import { defaultLocale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import ServiceLinksByTagsQueryGraphql, {
  serviceLinksByTagsQuery,
} from '@generated/serviceLinksByTagsQuery.graphql';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import React from 'react';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-blue text-2xl mb-l">{children}</h2>
);

const P = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={cn('text-sm', className)}>{children}</p>;

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
  serviceInstanceTag: ServiceInstanceTagEnum;
}

export const RegistrationLearnMore = async ({
  serviceInstanceTag,
}: RegistrationLearnMoreProps) => {
  const response = await serverFetchGraphQL<serviceLinksByTagsQuery>(
    ServiceLinksByTagsQueryGraphql,
    {
      tags: [ServiceInstanceTagEnum.TRIAL, serviceInstanceTag],
    },
    { cache: undefined, next: { revalidate: 3600 } }
  );

  const services = response.data
    .serviceInstanceLinksByTags as unknown as seoServiceInstanceFragment$data[];
  const t = await getTranslations();
  const platformName =
    serviceInstanceTag === ServiceInstanceTagEnum.OPENCTI
      ? 'OpenCTI'
      : 'OpenAEV';

  return (
    <>
      <Section className="bg-blue-800/5 px-xl">
        <div className="text-center w-[70%] m-auto">
          <H2>Your eXtended Threat Management (XTM) suite</H2>
          <P>
            {serviceInstanceTag === ServiceInstanceTagEnum.OPENCTI
              ? 'OpenCTI'
              : 'OpenAEV'}{' '}
            is part of Filigran’s open-source threat intelligence, advanced
            adversary simulation, and strategic cyber risk management solution
            designed to help your organization anticipate and manage threats
            end-to-end.
          </P>
        </div>
        <div className="flex flex-col lg:flex-row gap-xl">
          <div className="flex flex-col gap-s basis-full">
            <div className="border border-solid border-b rounded p-6 basis-full bg-[#09111F]">
              <h3 className="mb-m flex gap-s">
                <Image
                  width="25"
                  height="25"
                  src="/logo_opencti_dark.png"
                  alt={t('Service.Trials.XTMSuite.LogoAlt', {
                    name: 'OpenCTI',
                  })}
                />
                OpenCTI
              </h3>
              <P className="mb-s">
                <strong>{t('Service.Trials.XTMSuite.OpenCTITagline')}</strong>
              </P>
              <P>{t('Service.Trials.XTMSuite.OpenCTIDescription')}</P>
            </div>
            <div className="border border-solid border-b rounded p-6 basis-full bg-[#09111F]">
              <h3 className="mb-m flex gap-s">
                <Image
                  width="25"
                  height="25"
                  src="/logo_openaev_dark.png"
                  alt={t('Service.Trials.XTMSuite.LogoAlt', {
                    name: 'OpenAEV',
                  })}
                />
                OpenAEV
              </h3>
              <P className="mb-s">
                <strong>{t('Service.Trials.XTMSuite.OpenAEVTagline')}</strong>
              </P>
              <P>{t('Service.Trials.XTMSuite.OpenAEVDescription')}</P>
            </div>
          </div>
          <div className="basis-full m-auto">
            <Image
              width="1232"
              height="692"
              src={
                serviceInstanceTag === ServiceInstanceTagEnum.OPENCTI
                  ? `/opencti_ecosystem.png`
                  : '/openaev_ecosystem.png'
              }
              priority={false}
              loading="lazy"
              alt={t('Service.Trials.XTMSuite.IllustrationAlt')}
              className="rounded w-full"
            />
          </div>
        </div>
      </Section>
      <Section>
        <div className="flex flex-col lg:flex-row items-center gap-xl">
          <div className="basis-full flex justify-between gap-l">
            {services.map((service) => (
              <ServiceInstanceCard
                key={service.id}
                className="basis-full max-w-[50%]"
                serviceInstance={seoServiceInstanceToInstanceCardData(
                  service,
                  t,
                  defaultLocale
                )}
              />
            ))}
          </div>
          <div className="order-first lg:order-last basis-full">
            <H2>{t('Service.Trials.QuickStart.Title')}</H2>
            <P className="text-gray mb-l">
              {t('Service.Trials.QuickStart.Subtitle', { platformName })}
            </P>
            <P className="text-gray">
              {t('Service.Trials.QuickStart.Description')}
            </P>
          </div>
        </div>
      </Section>
    </>
  );
};
