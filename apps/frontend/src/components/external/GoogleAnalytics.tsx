/* eslint-disable prefer-rest-params */
'use client';
import Script from 'next/script';

const GoogleAnalytics = () => {
  return (
    <Script
      strategy="lazyOnload"
      src="https://www.googletagmanager.com/gtag/js?id=G-9FC0TL0TH3"
      onLoad={() => {
        window.dataLayer = window.dataLayer || [];
        function gtag(_a: unknown, _b: unknown) {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-9FC0TL0TH3');
      }}
    />
  );
};

export default GoogleAnalytics;
