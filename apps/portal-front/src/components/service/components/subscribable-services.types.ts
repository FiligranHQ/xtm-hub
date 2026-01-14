import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-form';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/integrations/forms/csv-feed-form';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenario-form';

export type ServiceFormValues =
  | CsvFeedFormValues
  | OpenAEVScenarioFormValues
  | CustomDashboardFormValues;
export type ServiceForm =
  | typeof CsvFeedForm
  | typeof OpenaevScenarioForm
  | typeof CustomDashboardForm;
