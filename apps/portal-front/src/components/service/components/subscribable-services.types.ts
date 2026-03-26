import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-form';
import {
  ConnectorForm,
  ConnectorFormValues,
} from '@/components/service/integrations/forms/connector-form';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/integrations/forms/csv-feed-form';
import {
  StreamForm,
  StreamFormValues,
} from '@/components/service/integrations/forms/stream-form';
import {
  TaxiiFeedForm,
  TaxiiFeedFormValues,
} from '@/components/service/integrations/forms/taxii-feed-form';
import {
  ThirdPartyIntegrationForm,
  ThirdPartyIntegrationFormValues,
} from '@/components/service/integrations/forms/third-party-integration-form';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenario-form';

export type ServiceFormValues =
  | CsvFeedFormValues
  | TaxiiFeedFormValues
  | StreamFormValues
  | OpenAEVScenarioFormValues
  | CustomDashboardFormValues
  | ThirdPartyIntegrationFormValues
  | ConnectorFormValues;
export type ServiceForm =
  | typeof CsvFeedForm
  | typeof TaxiiFeedForm
  | typeof StreamForm
  | typeof OpenaevScenarioForm
  | typeof CustomDashboardForm
  | typeof ThirdPartyIntegrationForm
  | typeof ConnectorForm;
