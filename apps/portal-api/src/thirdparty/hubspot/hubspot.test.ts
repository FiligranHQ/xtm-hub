import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  contextAdminSecondOrga,
  requestContextAdminSecondOrga,
} from '../../../tests/tests.const';
import { requestContext } from '../../context/request.context';
import DeploymentRequest from '../../model/kanel/public/DeploymentRequest';
import { UserLoadUserBy } from '../../model/user';
import { insertDeploymentRequest } from '../../modules/services/deployments/deployments.test.utils';
import { logApp } from '../../utils/app-logger.util';
import * as utils from '../../utils/utils';
import { hubspotReachOutSalesHook } from './hubspot';

describe('Hubspot', () => {
  let fetchSpy: MockInstance;
  let logSpy: MockInstance;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);
    logSpy = vi.spyOn(logApp, 'error');
    vi.spyOn(utils, 'isValidUrl').mockReturnValue(true);
  });

  afterEach(async () => {
    await db<DeploymentRequest>('DeploymentRequest').del();
    vi.restoreAllMocks();
  });

  describe('reachOutSales', () => {
    it('should log error when request is retrieved from platform id but is not found', async () => {
      const platformId = uuidv4();
      await hubspotReachOutSalesHook({ platformId });

      expect(logSpy).toHaveBeenCalledWith(
        'An error occurred while sending the Hubspot reachOutSales hook',
        {
          error: new Error(
            `No deployment request found for platform id: ${platformId}`
          ),
        }
      );
    });

    it('should log error when request is retrieved from platform id and user is not authorized', async () => {
      const platformId = uuidv4();
      const deploymentRequest = await insertDeploymentRequest({
        platform_id: platformId,
      });
      requestContext.set(requestContextAdminSecondOrga);

      await hubspotReachOutSalesHook({ platformId });

      expect(logSpy).toHaveBeenCalledWith(
        'An error occurred while sending the Hubspot reachOutSales hook',
        {
          error: new Error(
            `Deployment request ${deploymentRequest.id}, organization ${deploymentRequest.organization_requester_id} does not match user ${contextAdminSecondOrga.user.id} organizations`
          ),
        }
      );
    });

    it('should log an error when request is not found with platform token', async () => {
      const platformToken = uuidv4();
      await hubspotReachOutSalesHook({ platformToken });

      expect(logSpy).toHaveBeenCalledWith(
        'An error occurred while sending the Hubspot reachOutSales hook',
        {
          error: new Error(
            `No deployment request found for platform token: ${platformToken}`
          ),
        }
      );
    });

    it('should log an error when user is not authenticated and all parameters are missing', async () => {
      requestContext.set({
        user: {} as UserLoadUserBy,
      });
      await hubspotReachOutSalesHook({});

      expect(logSpy).toHaveBeenCalledWith(
        'An error occurred while sending the Hubspot reachOutSales hook',
        {
          error: new Error(
            'Either userId, platformToken or platformId must be provided'
          ),
        }
      );
    });

    it('should send message when request is retrieved from platform id and user is authorized', async () => {
      const platformId = uuidv4();
      await insertDeploymentRequest({
        platform_id: platformId,
      });

      await hubspotReachOutSalesHook({ platformId });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            type: 'reachOutSales',
            email: 'admin@filigran.io',
            firstname: 'Al',
            lastname: 'Beback',
            company: 'Filigran',
            job_title: 'myJob',
            message:
              'Message sent for free trial: pending opencti trial.\nUse Case: use_case\n\nPlease contact me about the OpenCTI free trial',
            use_case: 'use_case',
          }),
        })
      );
    });

    it('should send message when request is retrieved from platform token', async () => {
      const deploymentRequest = await insertDeploymentRequest({});

      await hubspotReachOutSalesHook({
        platformToken: deploymentRequest.platform_token!,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            type: 'reachOutSales',
            email: 'admin@filigran.io',
            firstname: 'Al',
            lastname: 'Beback',
            company: 'Filigran',
            job_title: 'myJob',
            message:
              'Message sent for free trial: pending opencti trial.\nUse Case: use_case\n\nPlease contact me about the OpenCTI free trial',
            use_case: 'use_case',
          }),
        })
      );
    });

    it('should send empty message when request is not found from user id and platform identifier', async () => {
      await hubspotReachOutSalesHook({});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            type: 'reachOutSales',
            email: 'admin@filigran.io',
            firstname: 'Al',
            lastname: 'Beback',
            company: 'Filigran',
            job_title: '',
            message: 'opencti: Please contact me about the OpenCTI free trial',
            use_case: '',
          }),
        })
      );
    });

    it('should send full message when request is found from user id and platform identifier', async () => {
      await insertDeploymentRequest({});
      await hubspotReachOutSalesHook({});
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            type: 'reachOutSales',
            email: 'admin@filigran.io',
            firstname: 'Al',
            lastname: 'Beback',
            company: 'Filigran',
            job_title: 'myJob',
            message:
              'Message sent for free trial: pending opencti trial.\nUse Case: use_case\n\nPlease contact me about the OpenCTI free trial',
            use_case: 'use_case',
          }),
        })
      );
    });
  });
});
