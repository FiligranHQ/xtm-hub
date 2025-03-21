/* eslint-disable prefer-rest-params */
import Script from 'next/script';

export default function GoogleAnalytics() {
  return (
    <Script
      strategy="lazyOnload"
      src="https://www.googletagmanager.com/gtag/js?id=G-9FC0TL0TH3"
      onLoad={() => {
        window.dataLayer = window.dataLayer || [];
        function gtag(_a: unknown, _b: unknown) {
          window.dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-9FC0TL0TH3');
      }}
    />
  );
}
