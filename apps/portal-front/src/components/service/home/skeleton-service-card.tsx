'use client';

import { LogoFiligranIcon } from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface SkeletonServiceCardProps {
  isTrialRequested: boolean;
}

const SkeletonServiceCard: React.FunctionComponent<
  SkeletonServiceCardProps
> = ({ isTrialRequested }) => {
  const t = useTranslations();
  return (
    <li className="relative border border-light rounded flex cursor-pointer">
      <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
        <div className="bg-blue-900 flex relative justify-center items-center flex-col gap-s overflow-hidden box-border px-s">
          <LogoFiligranIcon className="absolute  opacity-[0.03] z-1 size-60 rotate-45 -translate-x-24 -translate-y-12" />
          <div className="mt-s flex items-center h-12 w-full">
            <span className="p-s ml-auto rounded from-blue to-turquoise-300 bg-gradient-to-r border-none uppercase text-xs text-black">
              {isTrialRequested
                ? t('Service.Trials.Display.Requested')
                : t('Service.Trials.Display.New')}
            </span>
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="rounded-t overflow-visible">
            <>
              <Image
                width="580"
                height="281"
                src={`/opencti_registration-private-platform-illustration.png`}
                priority={false}
                loading="lazy"
                alt={`Illustration of free trial service`}
                className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/3 -rotate-45"
              />
            </>
          </AspectRatio>
        </div>
        <div className="min-h-40 flex flex-col p-l gap-l flex-1 bg-page-background group-hover:bg-hover">
          <div className="flex items-start min-h-12 w-full text-ellipsis overflow-hidden">
            <Link
              href={'app/service/free-trial'}
              className="focus-visible:outline-none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 z-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto">
              <h2>{t('Service.Trials.Display.Title')}</h2>
            </Link>
          </div>
          <p className="txt-sub-content text-muted-foreground">
            {t('Service.Trials.Display.FreeTrialDescription')}
          </p>
        </div>
      </div>
    </li>
  );
};

export default SkeletonServiceCard;
