import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/ReachSalesButton';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import {
  DeploymentRequestDeploymentType,
  ReachSalesMutation,
  ReachSalesMutationVariables,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

const GQL_OPERATION_REACH_SALES = 'ReachSales';
const MESSAGE = 'I would like to extend my trial';
const REACH_SALES_LABEL = 'Service.Trials.ReachOutToSales';
const SUCCESS_TITLE = 'Service.Trials.ReachOutToSalesSuccessTitle';

describe('ReachSalesButton', () => {
  it('should send the message as a bundle request when the form is submitted', async () => {
    // Given
    let capturedVariables: ReachSalesMutationVariables | undefined;
    mswServer.use(
      graphql.mutation<ReachSalesMutation, ReachSalesMutationVariables>(
        GQL_OPERATION_REACH_SALES,
        ({ variables }) => {
          capturedVariables = variables;
          return HttpResponse.json({
            data: { contactUs: { success: true } },
          });
        }
      )
    );
    const { user } = testRender(<ReachSalesButton variant="default" />);
    await user.click(screen.getByRole('button', { name: REACH_SALES_LABEL }));
    const dialog = await screen.findByRole('dialog');

    // When
    await user.type(within(dialog).getByRole('textbox'), MESSAGE);
    await user.click(
      within(dialog).getByRole('button', { name: REACH_SALES_LABEL })
    );

    // Then
    expect(await screen.findByText(SUCCESS_TITLE)).toBeInTheDocument();
    expect(capturedVariables).toEqual({
      message: MESSAGE,
      deploymentRequestType: DeploymentRequestDeploymentType.Bundle,
    });
  });
});
