'use server';
import { cn } from '@/lib/utils';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import ServiceLinksByTagsQueryGraphql, {
  serviceLinksByTagsQuery,
} from '@generated/serviceLinksByTagsQuery.graphql';
import Image from 'next/image';
import React from 'react';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import ServiceInstanceCard from '@/components/service/ServiceInstanceCard';

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
                  alt="OpenCTI Logo"
                />
                OpenCTI
              </h3>
              <P className="mb-s">
                <strong>Collect, correlate and leverage</strong>
              </P>
              <P>
                An open-source threat intelligence platform built by
                practitioners for practitioners - to break data silos and make
                threat intelligence truly actionable.
              </P>
            </div>
            <div className="border border-solid border-b rounded p-6 basis-full bg-[#09111F]">
              <h3 className="mb-m flex gap-s">
                <Image
                  width="25"
                  height="25"
                  src="/logo_openaev_dark.png"
                  alt="OpenAEV Logo"
                />
                OpenAEV
              </h3>
              <P className="mb-s">
                <strong>Prioritize, test and fix what matters</strong>
              </P>
              <P>
                Proactively defend against threats with Adversarial Exposure
                Validation (AEV), simulating real-life attack scenarios to
                optimize security defenses.
              </P>
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
              alt={`Illustration of free trial service`}
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
                serviceInstance={seoServiceInstanceToInstanceCardData(service)}
              />
            ))}
          </div>
          <div className="order-first lg:order-last basis-full">
            <H2>Quick start guide</H2>
            <P className="text-gray mb-l">
              Get more out of your{' '}
              {serviceInstanceTag === ServiceInstanceTagEnum.OPENCTI
                ? 'OpenCTI'
                : 'OpenAEV'}{' '}
              platform!
            </P>
            <P className="text-gray">
              Explore step-by-step guides, expert courses, and community
              feedback to solve real-world use cases and become a Filigran
              champion!
            </P>
          </div>
        </div>
      </Section>
    </>
  );
};
