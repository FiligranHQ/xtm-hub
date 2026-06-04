import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/CustomDashboardForm';
import {
  ConnectorForm,
  ConnectorFormValues,
} from '@/components/service/integrations/forms/ConnectorForm';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '@/components/service/integrations/forms/CsvFeedForm';
import {
  StreamForm,
  StreamFormValues,
} from '@/components/service/integrations/forms/StreamForm';
import {
  TaxiiFeedForm,
  TaxiiFeedFormValues,
} from '@/components/service/integrations/forms/TaxiiFeedForm';
import {
  ThirdPartyIntegrationForm,
  ThirdPartyIntegrationFormValues,
} from '@/components/service/integrations/forms/ThirdPartyIntegrationForm';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '@/components/service/openaev-scenarios/[serviceInstanceId]/OpenaevScenarioForm';

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
