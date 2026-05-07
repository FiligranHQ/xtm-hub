import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import Link from 'next/link';

interface SaaSFeaturesLinkProps {
  platformIdentifier: PlatformIdentifierEnum;
}

const SaaSFeaturesLink = () => (
  <Link
    href="https://filigran.io/offerings/software-as-a-service/"
    target="_blank"
    rel="noopener noreferrer"
    className="underline">
    Enterprise Edition SaaS features
  </Link>
);

const SLAParagraph = () => (
  <p className="text-sm mb-l">
    <strong>The free trial environment does not include SLA.</strong> In the
    event of a cloud provider outage, recovery time is not guaranteed. We
    recommend not storing critical or irreplaceable data in your trial
    environment.
  </p>
);

export const TrialsStorageLimitation = ({
  platformIdentifier,
}: SaaSFeaturesLinkProps) => {
  const isOpenCTI = platformIdentifier === PlatformIdentifierEnum.OPENCTI;

  return (
    <div className="p-6 rounded bg-white/[0.08]">
      <h2 className="text-blue text-2xl mb-l">
        Important note about your trial environment&apos;s storage
      </h2>
      {isOpenCTI ? (
        <>
          <p className="text-sm mb-l">
            The OpenCTI free trial provides users with a &quot;small&quot; SaaS
            instance, which includes all <SaaSFeaturesLink />, but with{' '}
            <strong>
              reduced computing power and storage (up to 40GB in intelligence
              data storage and 3GB in file storage).
            </strong>{' '}
            Ingesting large, premium feed with rich data sets during this trial
            could impact your storage quickly.
          </p>
          <SLAParagraph />
        </>
      ) : (
        <>
          <p className="text-sm mb-l">
            The OpenAEV free trial provides users with a &quot;small&quot;
            instance, which includes all <SaaSFeaturesLink />, but with a
            reduced computing power and a limited storage of{' '}
            <strong>16GB</strong>.
          </p>
          <SLAParagraph />
        </>
      )}
    </div>
  );
};
