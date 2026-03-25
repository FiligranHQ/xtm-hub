import { expect, test } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import XTMSuiteRoadmapPage from '../model/xtm-suite-roadmap.pageModel';
import { addEpic } from '../db-utils/epic.helper';
import { ADMIN_USER } from '../db-utils/const';

test.describe('XTM Suite Roadmap', () => {
  let loginPage: LoginPage;
  let xtmSuiteRoadmapPage: XTMSuiteRoadmapPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    xtmSuiteRoadmapPage = new XTMSuiteRoadmapPage(page);
  });
  test('Should allow Filigran user to perform a CRUD of an epic', async ({
    page,
  }) => {
    await loginPage.navigateToAndLogin();
    await xtmSuiteRoadmapPage.navigateToService();
    await test.step('Add an epic', async () => {
      await xtmSuiteRoadmapPage.addEpic({
        epic: 'Epic',
        title: 'Title',
        short_description: 'Short description',
        description: 'This is a test epic',
      });
      await xtmSuiteRoadmapPage.checkFilters({
        openCTINumbers: 1,
      });
      await expect(page.getByText(/^Epic$/)).toBeVisible();
    });
    await test.step('Update an epic', async () => {
      await xtmSuiteRoadmapPage.updateEpic({
        epic: 'EpicModified',
        title: 'TitleModified',
        description: 'This is a test epicModified',
        draft: false,
      });
      await xtmSuiteRoadmapPage.checkFilters({
        openCTINumbers: 1,
      });
      await expect(page.getByText('EpicModified')).toBeVisible();
    });
    await test.step('Delete an epic', async () => {
      await xtmSuiteRoadmapPage.deleteEpic();
      await xtmSuiteRoadmapPage.checkFilters({});
    });
    await test.step('Create an epic integration', async () => {
      await xtmSuiteRoadmapPage.addEpic({
        epic: 'Epic integration',
        title: 'Title integration',
        short_description: 'Short description for an integration',
        description: 'This is an integration epic',
        integration: true,
      });
      await xtmSuiteRoadmapPage.checkFilters({
        openCTINumbers: 1,
      });
    });
    await test.step('Create an epic draft', async () => {
      await xtmSuiteRoadmapPage.addEpic({
        epic: 'EpicDraft',
        title: 'TitleDraft',
        short_description: 'Short description for a draft',
        description: 'This is a draft epic',
        draft: true,
      });
      await xtmSuiteRoadmapPage.checkFilters({
        openCTINumbers: 2,
      });
    });
  });

  test('Should allow users that are not connected to view the xtm suite roadmap', async ({
    page,
  }) => {
    await testXTMSuiteRoadmapForUser(page);
  });

  test('Should allow community user to view the xtm suite roadmap', async ({
    page,
  }) => {
    await testXTMSuiteRoadmapForUser(page, 'user15@test.fr');
  });

  async function testXTMSuiteRoadmapForUser(page, userEmail?: string) {
    if (userEmail) {
      await loginPage.navigateToAndLogin(userEmail);
    } else {
      await loginPage.navigateToPublicPages();
    }

    await xtmSuiteRoadmapPage.navigateToService();

    await addEpic({
      epic: 'EpicDraft1',
      title: 'TitleDraft1',
      short_description: 'Short description for a draft',
      description: 'This is a draft epic',
      product: 'opencti',
      active: false,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });
    await addEpic({
      epic: 'Epic2',
      title: 'Title2',
      short_description: 'Short description',
      description: 'This is an epic',
      product: 'opencti',
      active: true,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });
    await addEpic({
      epic: 'Epic3',
      title: 'Title3',
      short_description: 'Short description for another epic',
      description: 'This is a second epic',
      product: 'openaev',
      active: true,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });
    await addEpic({
      epic: 'Epic4',
      title: 'Title4',
      short_description: 'Short description for now epic',
      description: 'This is a now epic',
      product: 'opencti',
      active: true,
      timeline: 'now',
      uploader_id: ADMIN_USER.ID,
    });

    await test.step("It should display the epics' page correctly", async () => {
      await expect(
        page.getByRole('button', { name: 'Create' })
      ).not.toBeVisible();

      await xtmSuiteRoadmapPage.checkFilters({
        openCTINumbers: 2,
        openAEVNumbers: 1,
      });

      await expect(
        page.getByText('EpicDraft1', { exact: true })
      ).not.toBeVisible();
      await expect(page.getByText('Epic2', { exact: true })).toBeVisible();
      await expect(page.getByText('Epic3', { exact: true })).toBeVisible();
    });
    await test.step('It should filter', async () => {
      await page.getByRole('button', { name: 'OpenAEV (1)' }).click();
      await expect(page.getByText('Epic2', { exact: true })).not.toBeVisible();
      await expect(page.getByText('Epic3', { exact: true })).toBeVisible();
    });

    await test.step('It should filter by timeline', async () => {
      await page.getByRole('button', { name: 'All products (3)' }).click();
      await page
        .getByRole('combobox')
        .filter({ hasText: 'All timelines' })
        .click();
      await page.getByLabel('Now').click();
      await expect(page.getByText('Epic4', { exact: true })).toBeVisible();
      await expect(page.getByText('Epic2', { exact: true })).not.toBeVisible();
      await expect(page.getByText('Epic3', { exact: true })).not.toBeVisible();
      await page.getByRole('combobox').filter({ hasText: 'Now' }).click();
      await page.getByLabel('All timelines').click();
      await expect(page.getByText('Epic2', { exact: true })).toBeVisible();
      await expect(page.getByText('Epic3', { exact: true })).toBeVisible();
      await expect(page.getByText('Epic4', { exact: true })).toBeVisible();
    });

    await test.step('It should display details', async () => {
      await page.getByText('Epic3').click();
      await expect(
        page.getByText('This is a second epic', { exact: true })
      ).toBeVisible();
    });
  }
});
