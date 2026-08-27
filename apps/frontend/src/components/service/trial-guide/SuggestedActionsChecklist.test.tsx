import { SuggestedActionsChecklist } from '@/components/service/trial-guide/SuggestedActionsChecklist';
import { TrialGuideChecklistItem } from '@/components/service/trial-guide/TrialGuide.content';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const buildChecklistItems = (
  overrides?: Partial<TrialGuideChecklistItem>[]
): TrialGuideChecklistItem[] => [
  {
    id: 'activate-feeds',
    titleKey: 'Service.TrialGuide.Opencti.ChecklistItems.ActivateFeeds.Title',
    descriptionKey:
      'Service.TrialGuide.Opencti.ChecklistItems.ActivateFeeds.Description',
    readMoreUrl: 'https://docs.opencti.io/',
    ...(overrides?.[0] ?? {}),
  },
  {
    id: 'configure-pir',
    titleKey: 'Service.TrialGuide.Opencti.ChecklistItems.ConfigurePir.Title',
    descriptionKey:
      'Service.TrialGuide.Opencti.ChecklistItems.ConfigurePir.Description',
    readMoreUrl: 'https://docs.opencti.io/',
    ...(overrides?.[1] ?? {}),
  },
];

describe('SuggestedActionsChecklist', () => {
  it('renders the intro copy and a numbered item per checklist entry', () => {
    testRender(
      <SuggestedActionsChecklist checklistItems={buildChecklistItems()} />
    );

    expect(
      screen.getByText('Service.TrialGuide.ChecklistIntroTitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Service.TrialGuide.Opencti.ChecklistItems.ActivateFeeds.Title'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Service.TrialGuide.Opencti.ChecklistItems.ConfigurePir.Title'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('only renders a Read more link when a readMoreUrl is set', () => {
    testRender(
      <SuggestedActionsChecklist
        checklistItems={buildChecklistItems([{}, { readMoreUrl: '' }])}
      />
    );

    const readMoreLinks = screen.getAllByRole('link', {
      name: /Service.TrialGuide.ReadMore/,
    });
    expect(readMoreLinks).toHaveLength(1);
  });
});
