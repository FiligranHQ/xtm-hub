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
import Image from 'next/image';
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
  <section className={cn(className, 'flex flex-col gap-xxl py-20')}>
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
      <Section>
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
            <H2>What can you do with OpenCTI trial?</H2>
            <P>
              OpenCTI trial provides you{' '}
              <strong>30 days access to explore all key functionality</strong> -
              gather and enrich intelligence, use powerful tools to visualize
              relationships, run investigations, and try our extensive
              integrations.
            </P>
          </article>
        </div>
        <div className="flex justify-between gap-l">
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="text-blue mb-s font-bold">Ingestion</h3>
            <P>
              Consolidate your disparate threat feeds into a centralized
              platform with 300+ integrations, using a consistent STIX 2.1 data
              model.
            </P>
          </article>
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="text-blue mb-s font-bold">Processing</h3>
            <P>
              Work with modern & intuitive dashboards with powerful
              visualizations, knowledge hypergraph and playbooks to pivot across
              actors, malware, TTPs, and indicators with visual graphs,
              timelines, and ATT&CK mappings. Customize your dashboard depending
              on your use case like threat monitoring, threat hunting, incident
              response and investigations. Make AI your companion at every step
              of your activities.
            </P>
          </article>
          <article className="border border-solid border-b rounded p-6 basis-full">
            <h3 className="text-blue mb-s font-bold">Output</h3>
            <P>
              Make threat intelligence flow through your entire security
              systems. Role based sharing and dissemination across teams and
              tools for timely action. Use OpenAEV to validate and improve your
              security postures (fully integrated with OpenCTI).
            </P>
          </article>
        </div>
      </Section>
      <Section className="bg-[#0A101F] px-xl">
        <div className="text-center w-[80%] m-auto">
          <H2>Who are we ?</H2>
          <P>
            Filigran stands out stand out in the crowded cyber security
            ecosystem with our unique open-source, threat-informed cybersecurity
            solutions. Our eXtended Threat Management (XTM) suite is designed to
            help organizations anticipate cyberattacks and manage threats
            end-to-end. The suite currently includes two solutions:
          </P>
        </div>
        <div className="flex gap-xl">
          <div className="flex flex-col gap-s basis-full">
            <div className="border border-solid border-b rounded p-6 basis-full bg-[#09111F]">
              <h3 className="mb-m">OpenCTI</h3>
              <P>
                Structure and operationalize threat intelligence across
                technical, operational, and strategic levels, enabling security
                teams to contextualize attacks and act proactively.
                <br />
                <strong>
                  Collect, Correlate and Leverage. Know what you need to care
                  about!
                </strong>
              </P>
            </div>
            <div className="border border-solid border-b rounded p-6 basis-full bg-[#09111F]">
              <h3 className="mb-m">OpenAEV</h3>
              <P>
                Help identify critical vulnerabilities and strengthen
                organizational security posture through advanced attack
                simulations, resilience testing, and crisis management
                exercises.
                <br />
                <strong>
                  Prioritize, Validate and Fix Improve your security posture
                  across tools, processes and people!
                </strong>
              </P>
            </div>
          </div>
          <div className="basis-full">
            <Image
              width="616"
              height="346"
              src={`/xtm_schema.jpg`}
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
              Explore these resources to get more out of your OpenCTI platform.
            </P>
            <P className="text-gray">
              From Step by step guides to expert courses and community best
              practices, these links help your team level up faster and solve
              real-word use cases.
            </P>
          </div>
        </div>
      </Section>
    </>
  );
};
