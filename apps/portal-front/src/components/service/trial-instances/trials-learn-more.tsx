import { cn } from '@/lib/utils';
import {
  AnalyticsIcon,
  ArrowRightAltIcon,
  ArrowsInputIcon,
  ArrowsOutputIcon,
} from '@filigran/icon';
import Link from 'next/link';
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

export const TrialsLearnMore: React.FC = () => {
  return (
    <>
      <section className="flex flex-col gap-xxl py-20 pt-0">
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
      </section>
    </>
  );
};
