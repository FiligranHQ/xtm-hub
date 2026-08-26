import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getTranslate } from '@/hooks/get-translate';
import { RelayProvider } from '@/relay/relay-provider';
import { GradientButton } from '@filigran/ui/servers';
import { PlatformIdentifier, ServiceInstanceTag } from '@graphql/generated';
import Link from 'next/link';

interface PublicFreeTrialContentProps {
  locale: string;
  platformIdentifier: PlatformIdentifier;
  serviceInstanceTag: ServiceInstanceTag;
  // Translation key for the breadcrumb's last (current-page) label, e.g.
  // "Service.Trials.OpenCTIPlatformBreadcrumb".
  breadcrumbLabelKey: string;
  redirectHref: string;
}

// Shared body of the public OpenCTI/OpenAEV free-trial pages — extracted so
// both real (public)/[locale]/cybersecurity-solutions/*-free-trial pages
// (which additionally generate SEO metadata + JSON-LD) can render the exact
// same content, same convention as Homepage for the homepage. TrialsHeader's
// "Welcome to Filigran" line uses useTranslate(), editable on any page once
// the xtm-edit-mode cookie is set (see app/edition/route.ts).
export const PublicFreeTrialContent = async ({
  locale,
  platformIdentifier,
  serviceInstanceTag,
  breadcrumbLabelKey,
  redirectHref,
}: PublicFreeTrialContentProps) => {
  const breadcrumbs = [
    { label: 'MenuLinks.Home', href: `/${locale}` },
    { label: breadcrumbLabelKey },
  ];
  const t = await getTranslate();

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RelayProvider>
        <TrialsHeader
          platformIdentifier={platformIdentifier}
          actions={
            <GradientButton className="bg-background dark:bg-none">
              <Link
                href={redirectHref}
                prefetch={false}>
                {t('Service.Trials.StartTrial')}
              </Link>
            </GradientButton>
          }
        />
        <TrialsLearnMore platformIdentifier={platformIdentifier} />
        <RegistrationLearnMore serviceInstanceTag={serviceInstanceTag} />
      </RelayProvider>
    </>
  );
};
