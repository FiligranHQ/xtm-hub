import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from '../custom-dashboards/[serviceInstanceId]/CustomDashboardForm';
import {
  ConnectorForm,
  ConnectorFormValues,
} from '../integrations/forms/ConnectorForm';
import {
  CsvFeedForm,
  CsvFeedFormValues,
} from '../integrations/forms/CsvFeedForm';
import { StreamForm, StreamFormValues } from '../integrations/forms/StreamForm';
import {
  TaxiiFeedForm,
  TaxiiFeedFormValues,
} from '../integrations/forms/TaxiiFeedForm';
import {
  ThirdPartyIntegrationForm,
  ThirdPartyIntegrationFormValues,
} from '../integrations/forms/ThirdPartyIntegrationForm';
import {
  OpenaevScenarioForm,
  OpenAEVScenarioFormValues,
} from '../openaev-scenarios/[serviceInstanceId]/OpenaevScenarioForm';

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
