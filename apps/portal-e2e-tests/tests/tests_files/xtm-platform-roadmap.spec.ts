import { expect, test } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import XTMPlatformRoadmapPage from '../model/xtm-platform-roadmap.pageModel';
import { addEpic } from '../db-utils/epic.helper';
import { ADMIN_USER } from '../db-utils/const';

test.describe('XTM Platform Roadmap', () => {
  let loginPage: LoginPage;
  let xtmPlatformRoadmapPage: XTMPlatformRoadmapPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    xtmPlatformRoadmapPage = new XTMPlatformRoadmapPage(page);
  });
  test('Should allow Filigran user to perform a CRUD of an epic', async ({
    page,
  }) => {
    await loginPage.navigateToAndLogin();
    await xtmPlatformRoadmapPage.navigateToService();
    await test.step('Add an epic', async () => {
      await xtmPlatformRoadmapPage.addEpic({
        title: 'Title',
        short_description: 'Short description',
        description: 'This is a test epic',
      });

      await expect(
        page.getByRole('combobox').filter({ hasText: 'OpenCTI (1)' })
      ).toBeVisible();

      await expect(page.getByText(/^Title$/)).toBeVisible();
    });
    await test.step('Update an epic', async () => {
      await xtmPlatformRoadmapPage.updateEpic({
        title: 'TitleModified',
        description: 'This is a test epicModified',
        draft: false,
      });
      await expect(
        page.getByRole('combobox').filter({ hasText: 'OpenCTI (1)' })
      ).toBeVisible();
      await expect(page.getByText('TitleModified')).toBeVisible();
    });
    await test.step('Delete an epic', async () => {
      await xtmPlatformRoadmapPage.deleteEpic();
      await expect(
        page.getByRole('combobox').filter({ hasText: 'OpenCTI (0)' })
      ).toBeVisible();
    });
    await test.step('Create an epic integration', async () => {
      await xtmPlatformRoadmapPage.addEpic({
        title: 'Title integration',
        short_description: 'Short description for an integration',
        description: 'This is an integration epic',
        integration: true,
      });
      await expect(
        page.getByRole('combobox').filter({ hasText: 'OpenCTI (1)' })
      ).toBeVisible();
    });
    await test.step('Create an epic draft', async () => {
      await xtmPlatformRoadmapPage.addEpic({
        title: 'TitleDraft',
        short_description: 'Short description for a draft',
        description: 'This is a draft epic',
        draft: true,
      });
      await expect(
        page.getByRole('combobox').filter({ hasText: 'OpenCTI (2)' })
      ).toBeVisible();
    });
  });

  test('Should allow users that are not connected to view the xtm platform roadmap', async ({
    page,
  }) => {
    await testXTMPlatformRoadmapForUser(page);
  });

  test('Should allow community user to view the xtm platform roadmap', async ({
    page,
  }) => {
    await testXTMPlatformRoadmapForUser(page, 'user15@test.fr');
  });

  async function testXTMPlatformRoadmapForUser(page, userEmail?: string) {
    if (userEmail) {
      await loginPage.navigateToAndLogin(userEmail);
    } else {
      await loginPage.navigateToPublicPages();
    }

    await addEpic({
      title: 'TitleDraft1',
      short_description: 'Short description for a draft',
      description: 'This is a draft epic',
      product: 'opencti',
      active: false,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });
    await addEpic({
      title: 'Title2',
      short_description: 'Short description',
      description: 'This is an epic',
      product: 'opencti',
      active: true,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });
    await addEpic({
      title: 'Title3',
      short_description: 'Short description for another epic',
      description: 'This is a second epic',
      product: 'openaev',
      active: true,
      timeline: 'next',
      uploader_id: ADMIN_USER.ID,
    });

    await page.goto('/cybersecurity-solutions/xtm-platform-roadmap');

    await test.step("It should display the epics' page correctly", async () => {
      await expect(
        page.getByRole('button', { name: 'Create' })
      ).not.toBeVisible();

      await expect(
        page.getByText('TitleDraft1', { exact: true })
      ).not.toBeVisible();
      await expect(page.getByText('Title2', { exact: true })).toBeVisible();
      await expect(page.getByText('Title3', { exact: true })).toBeVisible();
    });
    await test.step('It should filter', async () => {
      await page.getByText('Filter by product').click();
      await page.getByText('OpenAEV (1)').click();
      await expect(page.getByText('Title2', { exact: true })).not.toBeVisible();
      await expect(page.getByText('Title3', { exact: true })).toBeVisible();
    });

    await test.step('It should display details', async () => {
      await page.getByText('Title3').click();
      await expect(
        page.getByText('This is a second epic', { exact: true })
      ).toBeVisible();
    });
  }
});
