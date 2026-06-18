import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import portalConfig from '../../config';

const mailServiceMock = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
}));

// Keep buildServiceLink real (we want to verify the resolved URL),
// only stub the actual send.
vi.mock('../../server/mail-service', async () => {
  const actual = await vi.importActual<
    typeof import('../../server/mail-service')
  >('../../server/mail-service');
  return { ...actual, sendMail: mailServiceMock.sendMail };
});

// Bypass the "is it the 25th?" guard — covered by roadmap-reminder.util.test.ts.
vi.mock('../../utils/roadmap-reminder.util', () => ({
  isRoadmapReminderDay: vi.fn(() => true),
}));

import { EpicApp } from './epic.app';

describe('epicApp.sendPublicRoadmapMonthlyReminder', () => {
  let originalFlag: boolean;

  beforeEach(() => {
    originalFlag = portalConfig.enabled_emails.public_roadmap_monthly_reminder;
    portalConfig.enabled_emails.public_roadmap_monthly_reminder = true;
    mailServiceMock.sendMail.mockClear();
  });

  afterEach(() => {
    portalConfig.enabled_emails.public_roadmap_monthly_reminder = originalFlag;
  });

  it('sends the reminder to the PMs with a link resolved from the roadmap instance', async () => {
    await EpicApp.sendPublicRoadmapMonthlyReminder();

    expect(mailServiceMock.sendMail).toHaveBeenCalledTimes(1);

    const [payload] = mailServiceMock.sendMail.mock.calls[0] as [
      { to: string; template: string; params: { roadmapLink: string } },
    ];
    expect(payload.to).toBe('product.managers@filigran.io');
    expect(payload.template).toBe('public_roadmap_monthly_reminder');
    // buildServiceLink ran for real against the seeded roadmap instance.
    expect(payload.params.roadmapLink).toMatch(
      /\/app\/service\/xtm_platform_roadmap\/.+/
    );
  });

  it('does not send when the feature flag is disabled', async () => {
    portalConfig.enabled_emails.public_roadmap_monthly_reminder = false;

    await EpicApp.sendPublicRoadmapMonthlyReminder();

    expect(mailServiceMock.sendMail).not.toHaveBeenCalled();
  });
});
