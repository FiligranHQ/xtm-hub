'use client';

import { TrialsStorageLimitation } from '@/components/service/trial-instances/TrialsStorageLimitation';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import {
  FiligranWebsiteUtmCampaign,
  withFiligranWebsiteUtm,
} from '@/utils/filigran-website-utm';
import {
  AnalyticsIcon,
  ArrowRightAltIcon,
  ArrowsInputIcon,
  ArrowsOutputIcon,
} from '@filigran/icon';
import { PlatformIdentifier } from '@graphql/generated';
import Link from 'next/link';
import React from 'react';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-filigran-brand-primary text-2xl mb-4">{children}</h2>
);

const P = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={cn('text-sm', className)}>{children}</p>;

interface H2Props {
  platformIdentifier: PlatformIdentifier;
}

export const TrialsLearnMore = ({ platformIdentifier }: H2Props) => {
  const t = useTranslate();
  const baseTranslationKey = `Service.Trials.LearnMore.${platformIdentifier}`;
  return (
    <>
      <section className="flex flex-col gap-8 py-20 pt-0">
        <div className="flex flex-col gap-6 items-center lg:flex-row">
          <div className="w-[413px]">
            <iframe
              width="413"
              height="232"
              allowFullScreen
              src={
                platformIdentifier === PlatformIdentifier.Opencti
                  ? 'https://www.youtube.com/embed/KwF22zye3iI'
                  : 'https://www.youtube.com/embed/wb_v7sa7y8w'
              }
            />
          </div>
          <article className="p-6 w-full md-w-[60%]">
            <H2>{t(`${baseTranslationKey}.WhatCanYouDo.Title`)}</H2>
            <P className="mb-4">
              {t(`${baseTranslationKey}.WhatCanYouDo.FirstParagraph`)}
            </P>
            <P className="mb-4">
              {t(`${baseTranslationKey}.WhatCanYouDo.SecondParagraph`)}
            </P>
            <P>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={
                  platformIdentifier === PlatformIdentifier.Opencti
                    ? withFiligranWebsiteUtm(
                        'https://filigran.io/offerings/opencti-enterprise-edition/',
                        {
                          campaign: FiligranWebsiteUtmCampaign.OTHER,
                          content: 'trial_opencti_enterprise_edition',
                        }
                      )
                    : withFiligranWebsiteUtm(
                        'https://filigran.io/offerings/openaev-enterprise-edition/',
                        {
                          campaign: FiligranWebsiteUtmCampaign.OTHER,
                          content: 'trial_openaev_enterprise_edition',
                        }
                      )
                }
                className="underline flex gap-2 items-center">
                <ArrowRightAltIcon className="size-3" />
                {t(`${baseTranslationKey}.WhatCanYouDo.Link`)}
              </Link>
            </P>
          </article>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <article className="rounded p-6 basis-full bg-[var(--bg-elevation-default-layer-1)]">
            <h3 className="flex items-center gap-4 text-filigran-brand-primary mb-2 font-bold">
              <span className="p-2 bg-filigran-brand-primary-transparency-10 rounded">
                <ArrowsInputIcon className="size-4" />
              </span>
              {t(`${baseTranslationKey}.Blocks.First.Title`)}
            </h3>
            <P>{t(`${baseTranslationKey}.Blocks.First.Description`)}</P>
          </article>
          <article className="rounded p-6 basis-full bg-[var(--bg-elevation-default-layer-1)]">
            <h3 className="flex items-center gap-4 text-filigran-brand-primary mb-2 font-bold">
              <span className="p-2 bg-filigran-brand-primary-transparency-10 rounded">
                <AnalyticsIcon className="size-4" />
              </span>
              {t(`${baseTranslationKey}.Blocks.Second.Title`)}
            </h3>
            <P>{t(`${baseTranslationKey}.Blocks.Second.Description`)}</P>
          </article>
          <article className="rounded p-6 basis-full bg-[var(--bg-elevation-default-layer-1)]">
            <h3 className="flex items-center gap-4 text-filigran-brand-primary mb-2 font-bold">
              <span className="p-2 bg-filigran-brand-primary-transparency-10 rounded">
                <ArrowsOutputIcon className="size-4" />
              </span>
              {t(`${baseTranslationKey}.Blocks.Third.Title`)}
            </h3>
            <P>{t(`${baseTranslationKey}.Blocks.Third.Description`)}</P>
          </article>
        </div>
        <TrialsStorageLimitation platformIdentifier={platformIdentifier} />
      </section>
    </>
  );
};
