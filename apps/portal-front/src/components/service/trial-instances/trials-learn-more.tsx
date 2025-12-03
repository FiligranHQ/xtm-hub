'use client';
import {
  publicServiceListFragment,
  publicServiceListQuery,
} from '@/components/service/public-service.graphql';
import ServiceInstanceCard from '@/components/service/service-instance-card';
import { cn } from '@/lib/utils';
import { publicServiceInstanceToInstanceCardData } from '@/utils/services';
import { publicServiceList_services$key } from '@generated/publicServiceList_services.graphql';
import { publicServiceQuery } from '@generated/publicServiceQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import {
  AnalyticsIcon,
  ArrowRightAltIcon,
  ArrowsInputIcon,
  ArrowsOutputIcon,
} from 'filigran-icon';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

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
  const queryData = useLazyLoadQuery<publicServiceQuery>(
    publicServiceListQuery,
    {
      count: 10,
      orderBy: 'name',
      orderMode: 'desc',
    }
  );

  const [data] = useRefetchableFragment<
    publicServiceQuery,
    publicServiceList_services$key
  >(publicServiceListFragment, queryData);

  const documentationService = data.publicServiceInstances.edges.find(
    (edge) =>
      edge.node?.name?.toLowerCase().includes('opencti') &&
      edge.node?.name?.toLowerCase().includes('documentation')
  )?.node as serviceList_fragment$data;
  const blogService = data.publicServiceInstances.edges.find(
    (edge) =>
      edge.node?.name?.toLowerCase().includes('filigran') &&
      edge.node?.name?.toLowerCase().includes('blog')
  )?.node as serviceList_fragment$data;

  return (
    <>
      <Section className="pt-0">
        <div className="flex gap-xl items-center">
          <div className="w-[413px]">
            <iframe
              width="413"
              height="232"
              allowFullScreen
              src="https://www.youtube.com/embed/KwF22zye3iI"
            />
          </div>
          <article className="p-xl w-[60%]">
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
        <div className="flex justify-between gap-l">
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
        <div className="flex gap-xl">
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
              <P>
                <strong>Collect, correlate and leverage</strong>
                <br />
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
              <P>
                <strong>Prioritize, test and fix what matters</strong>
                <br />
                Proactively defend against threats with Adversarial Exposure
                Validation (AEV), simulating real-life attack scenarios to
                optimize security defenses.
              </P>
            </div>
          </div>
          <div className="basis-full">
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
        <div className="flex items-center gap-xl">
          <div className="basis-full flex justify-between gap-l">
            {documentationService && (
              <ServiceInstanceCard
                className="basis-full max-w-[50%]"
                serviceInstance={publicServiceInstanceToInstanceCardData(
                  documentationService
                )}
              />
            )}
            {blogService && (
              <ServiceInstanceCard
                className="basis-full max-w-[50%]"
                serviceInstance={publicServiceInstanceToInstanceCardData(
                  blogService
                )}
              />
            )}
          </div>
          <div className="basis-full">
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
