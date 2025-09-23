import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextAdminUser, THALES_ORGA_ID } from '../../../tests/tests.const';
import { ADMIN_UUID } from '../../portal.const';
import { telemetryApp } from '../telemetry/telemetry.app';
import { TELEMETRY_SOURCE } from '../telemetry/telemetry.const';
import { TelemetryEventType } from '../telemetry/telemetry.types';
import { organizationsApp } from './organizations.app';

describe('organizationsApp', () => {
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

      await organizationsApp.updateOrganization(
        contextAdminUser,
        THALES_ORGA_ID,
        { domains: ['thales.com', 'thales.fr'], name: 'new Thales' }
      );

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.UPDATE_ORGANIZATION,
        organization_id: THALES_ORGA_ID,
        organization_name: 'new Thales',
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
        domains: ['thales.com', 'thales.fr'],
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

      await organizationsApp.createOrganization(contextAdminUser, {
        domains: ['test.com', 'test.fr'],
        name: 'test.com',
      });

      expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
        '@timestamp': '2025-02-03T13:12:15.000Z',
        event_type: TelemetryEventType.CREATE_ORGANIZATION,
        organization_id: expect.any(String),
        organization_name: 'test.com',
        organization_type: 'Professional',
        source: TELEMETRY_SOURCE,
        user_id: ADMIN_UUID,
        domains: ['test.com', 'test.fr'],
      });
    });
  });
});
