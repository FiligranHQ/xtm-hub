import { ChecklistItem } from '@/components/service/trial-guide/ChecklistItem';
import { TrialGuideChecklistItem } from '@/components/service/trial-guide/TrialGuide.content';
import { useTranslations } from 'next-intl';

interface SuggestedActionsChecklistProps {
  checklistItems: TrialGuideChecklistItem[];
}

export const SuggestedActionsChecklist = ({
  checklistItems,
}: SuggestedActionsChecklistProps) => {
  const t = useTranslations();

  return (
    <section className="mt-xl">
      <h2 className="heading-lg mb-l">
        {t('Service.TrialGuide.ChecklistTitle')}
      </h2>
      <div className="text-center mb-l">
        <p className="heading-md text-filigran-brand-primary">
          {t('Service.TrialGuide.ChecklistIntroTitle')}
        </p>
        <p className="text-content-body-medium">
          {t('Service.TrialGuide.ChecklistIntroSubtitle')}
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        {checklistItems.map((item, index) => (
          <ChecklistItem
            key={item.id}
            index={index + 1}
            item={item}
          />
        ))}
      </div>
    </section>
  );
};

export default SuggestedActionsChecklist;
