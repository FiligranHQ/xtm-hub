import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import {
  OpenAEVScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/obas-scenarios/[serviceInstanceId]/openAEV-scenario-form';

export type ServiceFormValues = CsvFeedFormValues | OpenAEVScenarioFormValues;
export type ServiceForm = typeof CsvFeedForm | typeof OpenAEVScenarioForm;
