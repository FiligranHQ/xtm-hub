import { ConsentGate } from '@/components/cookie-consent/ConsentGate';
import GoogleAnalytics from '@/components/external/GoogleAnalytics';
import Hubspot from '@/components/external/Hubspot';

export const ManagedScripts = () => (
  <>
    <ConsentGate service="google-analytics">
      <GoogleAnalytics />
    </ConsentGate>
    <ConsentGate service="hubspot">
      <Hubspot />
    </ConsentGate>
  </>
);
