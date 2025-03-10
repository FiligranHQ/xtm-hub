import Script from 'next/script';

export default function Hubspot() {
  return (
    <Script
      strategy="lazyOnload"
      src="//js-eu1.hs-scripts.com/26791207.js"
    />
  );
}
