'use client';
import ServiceInstanceCard from '@/components/service/service-instance-card';
import {
  ServiceLinksByTagsQuery,
  serviceListFragment,
} from '@/components/service/service.graphql';
import { cn } from '@/lib/utils';
import { publicServiceInstanceToInstanceCardData } from '@/utils/services';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { serviceLinksByTagsQuery } from '@generated/serviceLinksByTagsQuery.graphql';
import { serviceList_fragment$key } from '@generated/serviceList_fragment.graphql';
import {
  AnalyticsIcon,
  ArrowRightAltIcon,
  ArrowsInputIcon,
  ArrowsOutputIcon,
} from 'filigran-icon';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';

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

export const TrialsLearnMore: React.FC = () => {
  const queryData = useLazyLoadQuery<serviceLinksByTagsQuery>(
    ServiceLinksByTagsQuery,
    {
      tags: [ServiceInstanceTagEnum.TRIAL, ServiceInstanceTagEnum.OPENCTI],
    }
  );

  const services = queryData.serviceInstanceLinksByTags.map((serviceRef) =>
    useFragment<serviceList_fragment$key>(serviceListFragment, serviceRef)
  );

  return (
    <>
      <Section className="pt-0">
        <div className="flex flex-col gap-xl items-center lg:flex-row">
          <div className="w-[413px]">
            <iframe
              width="413"
              height="232"
              allowFullScreen
              src="https://www.youtube.com/embed/KwF22zye3iI"
            />
          </div>
          <article className="p-xl w-full md-w-[60%]">
            <H2>What can you do with your OpenCTI trial?</H2>
            <P className="mb-l">
              Get 30 days to explore all OpenCTI functionalities and enrich your
              threat intelligence. This includes all OpenCTI Enterprise Edition
              features such as automated playbooks, ability to set-up priority
              intelligence requirements (PIRs), FINTEL, as well as AI-powered
              files import, report generation, and NLP search functionality.
            </P>
            <P className="mb-l">
              Explore how OpenCTI can support your specific needs—whether threat
              hunting, incident response, or case management—and integrate with
              your preferred data sources to make actionable threat intelligence
              flow across your security stack.
            </P>
            <P>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://filigran.io/offerings/opencti-enterprise-edition/"
                className="underline flex gap-s items-center">
                <ArrowRightAltIcon className="size-3" />
                Discover all OpenCTI Enterprise Edition features
              </Link>
            </P>
          </article>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-l">
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="flex items-center gap-l text-blue mb-s font-bold">
              <span className="p-2 bg-blue/5 rounded">
                <ArrowsInputIcon className="size-4" />
              </span>
              Ingestion
            </h3>
            <P>
              Consolidate and enrich threat intelligence from any
              feed—commercial, open-source, internal—into a centralized
              platform, leveraging 300+ integrations and standardized on the
              STIX 2.1 framework. Use AI-assisted import of CTI reports to save
              countless analyst hours.
            </P>
          </article>
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="flex items-center gap-l text-blue mb-s font-bold">
              <span className="p-2 bg-blue/5 bg-opacity-5 rounded">
                <AnalyticsIcon className="size-4" />
              </span>
              Processing
            </h3>
            <P>
              Access powerful dashboard visualizations, knowledge hypergraphs,
              and playbooks to pivot across threat actors using timelines and
              ATT&CK mappings. Tailor your dashboards to meet your threat or
              incident management needs, and make AI your companion at every
              step.
            </P>
          </article>
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="flex items-center gap-l text-blue mb-s font-bold">
              <span className="p-2 bg-blue/5 bg-opacity-5 rounded">
                <ArrowsOutputIcon className="size-4" />
              </span>
              Output
            </h3>
            <P>
              Make threat intelligence flow through your entire security system.
              Share and disseminate intelligence across teams and tools with
              role-based access for timely action. Use OpenAEV—fully integrated
              with OpenCTI—to validate and improve your security posture.
            </P>
          </article>
        </div>
      </Section>
      <Section className="bg-blue-800/5 px-xl">
        <div className="text-center w-[70%] m-auto">
          <H2>Your eXtended Threat Management (XTM) suite</H2>
          <P>
            OpenCTI is part of Filigran’s open-source threat intelligence,
            advanced adversary simulation, and strategic cyber risk management
            solution designed to help your organization anticipate and manage
            threats end-to-end.
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
              src={`/xtm_schema.png`}
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
                serviceInstance={publicServiceInstanceToInstanceCardData(
                  service
                )}
              />
            ))}
          </div>
          <div className="order-first lg:order-last basis-full">
            <H2>Quick start guide</H2>
            <P className="text-gray mb-l">
              Get more out of your OpenCTI platform!
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
