import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ErrorCode } from '../../../utils/error/error.code';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetrySource } from '../../telemetry/telemetry.const';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { organizationApp } from './organization.app';
import { OrganizationDomain } from './organization.domain';

describe('organizationApp', () => {
  afterEach(async () => {
    vi.useRealTimers();
  });
  describe('updateOrganization', () => {
    it('should send a telemetry event', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await organizationApp.updateOrganization(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        {
          domains: [
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST.NAME,
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.SECOND.NAME,
          ],
          name: 'new OrgaName',
        }
      );

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.UPDATE_ORGANIZATION,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        organization_name: 'new OrgaName',
        organization_type: 'Professional',
        source: TelemetrySource.XTMHUB,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        domains: [
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST.NAME,
          TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.SECOND.NAME,
        ],
      });
    });
  });

  describe('createOrganization', () => {
    it('should send a telemetry event', async () => {
      vi.useFakeTimers();
      const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
      vi.setSystemTime(date);
      const telemetrySpy = vi
        .spyOn(telemetryApp, 'sendTelemetryEvent')
        .mockResolvedValue();

      await organizationApp.createOrganization({
        domains: ['test.com', 'test.fr'],
        name: 'test.com',
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE_ORGANIZATION,
        organization_id: expect.any(String),
        organization_name: 'test.com',
        organization_type: 'Professional',
        source: TelemetrySource.XTMHUB,
        user_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        domains: ['test.com', 'test.fr'],
      });
    });

    it('should throw if an organization with the same domain exists', async () => {
      await OrganizationDomain.insertNewOrganization({
        id: uuidv4() as OrganizationId,
        name: 'domain1.io',
        domains: ['domain1.io', 'domain2.io'],
      });

      const call = organizationApp.createOrganization({
        domains: ['domain1.io'],
        name: 'otherDomain.io',
      });

      await expect(call).rejects.toThrow(
        ErrorCode.OrganizationSameDomainExists
      );
    });

    it('should throw if an organization with the same name exists', async () => {
      await OrganizationDomain.insertNewOrganization({
        id: uuidv4() as OrganizationId,
        name: 'alreadyExistingOrga',
        domains: ['alreadyExistingOrga.io'],
      });

      const call = organizationApp.createOrganization({
        domains: ['whatever.io'],
        name: 'alreadyExistingOrga',
      });

      await expect(call).rejects.toThrow(ErrorCode.OrganizationSameNameExists);
    });
  });

  describe('deleteOrganization', () => {
    it('should delete the organization', async () => {
      const organizationId = uuidv4() as OrganizationId;
      await OrganizationDomain.insertNewOrganization({
        id: organizationId,
        name: 'newOrganization',
        domains: ['orga.com'],
      });

      const newOrganization = await OrganizationDomain.loadOrganizationBy({
        id: organizationId,
      });
      expect(newOrganization).toBeDefined();

      await organizationApp.deleteOrganization(organizationId);

      const deletedOrganization = await OrganizationDomain.loadOrganizationBy({
        id: organizationId,
      });
      expect(deletedOrganization).toBeUndefined();
    });
  });
});
