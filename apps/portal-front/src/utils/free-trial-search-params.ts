import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { isValueInEnum } from './is-value-in-enum';

export interface FreeTrialSearchParams {
  openTrialForm: boolean;
  source: DeploymentRequestSourceEnum;
}

export const parseFreeTrialSearchParams = async (
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
): Promise<FreeTrialSearchParams> => {
  const params = await searchParams;

  const openFormParam = params.openForm;
  const openTrialForm = openFormParam === 'true';

  const sourceParam = params.source;
  const source = isValueInEnum(sourceParam, DeploymentRequestSourceEnum)
    ? sourceParam
    : DeploymentRequestSourceEnum.XTMHUB;

  return { openTrialForm, source };
};
