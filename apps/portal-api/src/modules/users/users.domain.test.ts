import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserThales,
  DEFAULT_ADMIN_EMAIL,
  requestContextSimpleUserThales,
  THALES_ADMIN_ORGA_EMAIL,
  THALES_ADMIN_ORGA_USER_ID,
  THALES_ORGA_ID,
  THALES_SIMPLE_USER_ID,
} from '../../../tests/tests.const';
import { requestContext } from '../../context/request.context';
import { UserId } from '../../model/kanel/public/User';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { telemetryApp } from '../telemetry/telemetry.app';
import { TELEMETRY_SOURCE } from '../telemetry/telemetry.const';
import { loadUserBy, updateUser, updateUserAtLogin } from './users.domain';

//Issue with test
describe('Users domain', () => {
  it('should load user Admin', async () => {
    const response = await loadUserBy({
      'User.id': ADMIN_UUID as UserId,
    });
    expect(response.email).toEqual(DEFAULT_ADMIN_EMAIL);
    expect(response.selected_organization_id).toEqual(
      PLATFORM_ORGANIZATION_UUID
    );
    expect(response.organization_capabilities).toHaveLength(2);
  });

  it('should throw FORBIDDEN_ACCESS when Simple User calls EditUser', async () => {
    try {
      requestContext.set(requestContextSimpleUserThales);
      await updateUser(THALES_ADMIN_ORGA_USER_ID, {
        email: THALES_ADMIN_ORGA_EMAIL,
      });
    } catch (error) {
      expect(error.name).toBe('FORBIDDEN_ACCESS');
    }
  });
  it('should send a login event', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();

    await updateUserAtLogin(contextSimpleUserThales.user);
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: 'login',
      organization_id: THALES_ORGA_ID,
      organization_name: 'Thales',
      organization_type: 'Professional',
      source: TELEMETRY_SOURCE,
      user_id: THALES_SIMPLE_USER_ID,
    });
  });
  afterEach(async () => {
    vi.useRealTimers();
  });
});
