import { CountBadge } from '@/components/ui/CountBadge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import React from 'react';

interface IntegrationAccordionProps {
  integrationType: string;
  count: number;
  children: React.ReactNode;
}

const IntegrationAccordion = ({
  integrationType,
  count,
  children,
}: IntegrationAccordionProps) => {
  const t = useTranslations();

  return (
    <Accordion
      type="single"
      collapsible>
      <AccordionItem value={integrationType}>
        <h2 className="m-0">
          <AccordionTrigger className="hover:cursor-pointer">
            <div className="inline-flex items-center gap-s">
              {t(`Service.OpenctiIntegrations.Type.${integrationType}`)}
              <CountBadge
                count={count}
                bgFadedClass={'bg-feedback-neutral-secondary-transparency'}
                textClass={'text-feedback-neutral-primary'}
              />
            </div>
          </AccordionTrigger>
        </h2>

        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default IntegrationAccordion;
