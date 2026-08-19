import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { SYSTEM_USER_UUID } from '../../portal.const';
import { EpicDomain } from './epic.domain';

describe('epicDomain', () => {
  afterEach(async () => {
    await TestHelper.epic.delete({});
  });

  describe('reassignUserEpicsToSystemUser', () => {
    it('should reassign uploader_id and updater_id of the user epics to the system user', async () => {
      const userId = TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID;
      const uploaded = await TestHelper.epic.create({
        title: 'reassign-uploaded',
        uploader_id: userId,
      });
      const updated = await TestHelper.epic.create({
        title: 'reassign-updated',
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        updater_id: userId,
      });

      await EpicDomain.reassignUserEpicsToSystemUser(userId);

      expect(await TestHelper.epic.load({ id: uploaded!.id })).toMatchObject({
        uploader_id: SYSTEM_USER_UUID,
      });
      expect(await TestHelper.epic.load({ id: updated!.id })).toMatchObject({
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        updater_id: SYSTEM_USER_UUID,
      });
    });

    it('should leave epics of other users untouched', async () => {
      const otherEpic = await TestHelper.epic.create({
        title: 'reassign-other',
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });

      await EpicDomain.reassignUserEpicsToSystemUser(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID
      );

      expect(await TestHelper.epic.load({ id: otherEpic!.id })).toMatchObject({
        uploader_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      });
    });

    it('should not throw when the user has no epics', async () => {
      await expect(
        EpicDomain.reassignUserEpicsToSystemUser(
          TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID
        )
      ).resolves.toBeUndefined();
    });
  });
});
