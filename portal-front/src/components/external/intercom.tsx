'use client';
import Script from 'next/script';
import { useContext, useEffect } from 'react';
import { PortalContext } from '../me/app-portal-context';

interface CustomWindow extends Window {
  intercomSettings?: Record<string, string>;
  Intercom?: (args: string, data?: Record<string, string>) => void;
}

export default function Intercom() {
  const { me } = useContext(PortalContext);
  useEffect(() => {
    const w = window as CustomWindow;
    const intercomSettings: Record<string, string> = {
      api_base: 'https://api-iam.intercom.io',
      app_id: 'mjwhgrbh',
    };
    if (me) {
      intercomSettings.user_id = me.id;
      intercomSettings.email = me.email;
      intercomSettings.name = `${me.first_name} ${me.last_name}`;
    }
    w.intercomSettings = intercomSettings;
    w.Intercom && w.Intercom('update', intercomSettings);
  }, [me]);

  return (
    <Script
      id="intercom-script"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
        (function(){
          var w=window;var ic=w.Intercom;
          if(typeof ic==="function"){
            ic('reattach_activator');ic('update',w.intercomSettings);
          } else {
            var d=document;var i=function(){i.c(arguments);};
            i.q=[];i.c=function(args){i.q.push(args);};
            w.Intercom=i;
            var l=function(){
              var s=d.createElement('script');
              s.type='text/javascript';
              s.async=true;
              s.src='https://widget.intercom.io/widget/mjwhgrbh';
              var x=d.getElementsByTagName('script')[0];
              x.parentNode.insertBefore(s,x);
            };
            if(document.readyState==='complete'){l();}
            else if(w.attachEvent){w.attachEvent('onload',l);}
            else{w.addEventListener('load',l,false);}
          }
        })();
        `,
      }}
    />
  );
}
