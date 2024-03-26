export interface AwxResponse {
  count: number;
  results: AwxResult[];
}

interface AwxResult {
  id: number;
  type: string;
  url: string;
  created: string;
  modified: string;
  name: string;
  description: string;
}
