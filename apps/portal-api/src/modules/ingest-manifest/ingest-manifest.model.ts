import { Connector } from '../services/integration-feeds/integration-feeds.model';

export interface ManifestInformation extends Partial<Connector> {
  labels: string[];
  logo: string; // URL or path to log
}
