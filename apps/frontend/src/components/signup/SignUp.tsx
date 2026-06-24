'use client';

import FiligranLogo from '@public/filigran_logo.svg';
import FiligranLogoDark from '@public/filigran_logo_dark.svg';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

const HUBSPOT_PORTAL_ID = '26791207';
const HUBSPOT_FORM_ID = '25cf9561-13c0-4eda-bde2-be099e38438b';
const HUBSPOT_REGION = 'eu1';

const SignUp = () => {
  const t = useTranslations('SignUpPage');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js-eu1.hsforms.net/forms/embed/v2.js';
    script.async = true;

    script.onload = () => {
      const win = window as Window & {
        hbspt?: {
          forms: {
            create: (options: {
              portalId: string;
              formId: string;
              region: string;
              target: string;
            }) => void;
          };
        };
      };
      if (win.hbspt) {
        win.hbspt.forms.create({
          portalId: HUBSPOT_PORTAL_ID,
          formId: HUBSPOT_FORM_ID,
          region: HUBSPOT_REGION,
          target: '#hubspot-form',
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <div className="bg-page-background dark:bg-background flex h-full w-2/5 flex-col px-6 py-6 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex justify-center">
          <FiligranLogoDark className="h-8.25 w-33" />
        </div>
        {/* Body */}
        <div className="mx-auto flex flex-1 min-h-0 w-full max-w-125 flex-col justify-center overflow-hidden">
          <h1 className="text-2xl leading-8 font-medium text-foreground">
            {t('Title1')}
            <br />
            {t('Title2')}
          </h1>
          <p className="mt-2 text-sm leading-6 font-bold text-foreground">
            {t('Subtitle')}
          </p>
          <p className="mt-2 text-xs leading-5 font-normal text-muted-foreground">
            {t('Description')}
          </p>
          <div
            id="hubspot-form"
            className="mt-l w-full"
          />
        </div>
        {/* Footer */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 text-xs">
          <p className="text-muted-foreground flex items-center gap-2">
            {t('AlreadyHaveAccount')}
            <Link
              href="/auth/oidc"
              className="text-primary underline">
              {t('LogIn')}
            </Link>
          </p>
          <div className="flex items-center gap-1 text-muted-foreground/50 text-[10px]">
            {t('MadeBy')}
            <FiligranLogo className="h-3 w-auto" />
          </div>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-black/60 w-3/5" />
    </div>
  );
};

export default SignUp;
