import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { pageRegisteredPlatformByServiceInstanceId_fragment$data } from '@generated/pageRegisteredPlatformByServiceInstanceId_fragment.graphql';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import React from 'react';

interface Props {
  platform: pageRegisteredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsDetailsPage: React.FC<Props> = ({ platform }) => {
  return (
    <>
      <TrialsHeader actions={<ContactUsButton />} />
      <section className="flex justify-between p-xl border border-solid border-blue rounded">
        <ul className="text-sm flex flex-col gap-l">
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
          <li>
            <span className="text-gray/60">Registration date:</span> TO BE
            DEFINED
          </li>
          <li>
            <span className="text-gray/60">License:</span> Free trial
          </li>
        </ul>

        <Button>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={platform.url}>
            Access OpenCTI
          </Link>
        </Button>
      </section>
      <TrialsLearnMore />
    </>
  );
};
