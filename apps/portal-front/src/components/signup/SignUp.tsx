'use client';

import { useEffect } from 'react';
import './SignUp.css';

const SignUp = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js-eu1.hsforms.net/forms/embed/v2.js';
    document.body.appendChild(script);

    script.addEventListener('load', () => {
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
          portalId: '26791207',
          formId: '25cf9561-13c0-4eda-bde2-be099e38438b',
          region: 'eu1',
          target: '#hubspot-form',
        });
      }
    });
  }, []);
  return <div id="hubspot-form" />;
};
export default SignUp;
