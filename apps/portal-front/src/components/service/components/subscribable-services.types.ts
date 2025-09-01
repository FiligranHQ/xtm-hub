import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-form';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenario-form';

export type ServiceFormValues = CsvFeedFormValues | OpenAEVScenarioFormValues;
export type ServiceForm = typeof CsvFeedForm | typeof OpenaevScenarioForm;
