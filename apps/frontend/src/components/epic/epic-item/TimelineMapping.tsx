import { Timeline } from '@graphql/generated';

export interface FiligranTimelineMetadata {
  labelKey: string;
  bgFadedClass: string;
  textClass: string;
  barClass: string;
}

export const FiligranTimelineMapping: Record<
  Timeline | 'draft',
  FiligranTimelineMetadata
> = {
  draft: {
    labelKey: 'Draft',
    bgFadedClass: 'bg-feedback-alert-secondary-transparency',
    textClass: 'text-feedback-alert-primary',
    barClass: 'bg-feedback-alert-primary',
  },
  [Timeline.Now]: {
    labelKey: 'Now',
    bgFadedClass: 'bg-feedback-warning-secondary-transparency',
    textClass: 'text-feedback-warning-primary',
    barClass: 'bg-feedback-warning-primary',
  },
  [Timeline.Next]: {
    labelKey: 'Next',
    bgFadedClass: 'bg-filigran-brand-primary-transparency',
    textClass: 'text-feedback-info-primary',
    barClass: 'bg-feedback-info-primary',
  },
  [Timeline.UnderConsideration]: {
    labelKey: 'UnderConsideration',
    bgFadedClass: 'bg-feedback-success-secondary-transparency',
    textClass: 'text-feedback-success-primary',
    barClass: 'bg-feedback-success-primary',
  },
  [Timeline.Finished]: {
    labelKey: 'Finished',
    bgFadedClass: 'bg-feedback-neutral-secondary-transparency',
    textClass: 'text-feedback-neutral-primary',
    barClass: 'bg-feedback-neutral-primary',
  },
};
