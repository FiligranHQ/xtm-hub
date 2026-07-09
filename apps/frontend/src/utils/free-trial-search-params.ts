import { isValueInEnum } from '@/utils/is-value-in-enum';
import { DeploymentRequestSource } from '@graphql/generated';

export interface FreeTrialSearchParams {
  openTrialForm: boolean;
  source: DeploymentRequestSource;
}

export const parseFreeTrialSearchParams = async (
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
): Promise<FreeTrialSearchParams> => {
  const params = await searchParams;

  const openFormParam = params.openForm;
  const openTrialForm = openFormParam === 'true';

  const sourceParam = params.source;
  const source = isValueInEnum(sourceParam, DeploymentRequestSource)
    ? sourceParam
    : DeploymentRequestSource.Xtmhub;

  return { openTrialForm, source };
};
