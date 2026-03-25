import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';

export interface FreeTrialSearchParams {
  openTrialForm: boolean;
  source: DeploymentRequestSourceEnum;
}

export const parseFreeTrialSearchParams = async (
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
): Promise<FreeTrialSearchParams> => {
  const params = await searchParams;

  const openFormParam = params.openForm;
  const openTrialForm = !!openFormParam && !Array.isArray(openFormParam);

  const sourceParam = params.source;
  const source: DeploymentRequestSourceEnum =
    !Array.isArray(sourceParam) &&
    sourceParam !== undefined &&
    (Object.values(DeploymentRequestSourceEnum) as string[]).includes(
      sourceParam
    )
      ? (sourceParam as DeploymentRequestSourceEnum)
      : DeploymentRequestSourceEnum.XTMHUB;

  return { openTrialForm, source };
};
