import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import {
  ObasScenarioForm,
  ObasScenarioFormValues,
} from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-form';

export type ServiceFormValues = CsvFeedFormValues | ObasScenarioFormValues;
export type ServiceForm = typeof CsvFeedForm | typeof ObasScenarioForm;
