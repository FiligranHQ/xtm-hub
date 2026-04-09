import { toGlobalId } from 'graphql-relay';
import { afterEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { CompetitorTier } from '../../../__generated__/resolvers-types';
import Competitor, {
  CompetitorId,
  CompetitorInitializer,
} from '../../../model/kanel/public/Competitor';
import { ErrorCode } from '../../../utils/error/error.code';
import { loadOrganizationBy } from '../../organization-management/organizations/organizations.domain';
import { CompetitorApp } from './competitor.app';
import { CompetitorDomain } from './competitor.domain';

const DEFAULT_COMPETITOR = {
  name: 'competitor',
  tier: CompetitorTier.Tier1,
  domain: 'competitor.com',
};

const createCompetitor = (overrides: Partial<CompetitorInitializer> = {}) =>
  CompetitorDomain.insertCompetitor({ ...DEFAULT_COMPETITOR, ...overrides });

describe('CompetitorApp', () => {
  afterEach(async () => {
    await db('Competitor').delete();
  });

  describe('insertCompetitor', () => {
    it('should insert competitor with domain in lowerCase', async () => {
      const competitor = await CompetitorApp.insertCompetitor({
        tier: CompetitorTier.Tier2,
        name: 'Competitor',
        domain: 'Other.com',
      });

      expect(competitor).toMatchObject({
        tier: CompetitorTier.Tier2,
        name: 'Competitor',
        domain: 'other.com',
      });
    });

    it('should insert competitor with domain trimmed', async () => {
      const competitor = await CompetitorApp.insertCompetitor({
        tier: CompetitorTier.Tier1,
        name: 'Competitor',
        domain: '  competitor.com  ',
      });

      expect(competitor.domain).toBe('competitor.com');
    });

    it('should throw CompetitorDomainAlreadyExists when a competitor with the same domain exists in a different case', async () => {
      await createCompetitor();

      await expect(
        CompetitorApp.insertCompetitor({
          ...DEFAULT_COMPETITOR,
          name: 'other competitor',
          domain: 'COMPETITOR.COM',
        })
      ).rejects.toThrow(ErrorCode.CompetitorDomainAlreadyExists);
    });
  });

  describe('updateCompetitorById', () => {
    it('should update competitor in lowerCase', async () => {
      const { id } = await createCompetitor();

      const updatedCompetitor = await CompetitorApp.updateCompetitorById({
        id: toGlobalId('Competitor', id!),
        tier: CompetitorTier.Tier2,
        name: 'COMPETITOR',
        domain: 'Other.com',
      });

      expect(updatedCompetitor).toMatchObject({
        tier: CompetitorTier.Tier2,
        name: 'COMPETITOR',
        domain: 'other.com',
      });
    });

    it('should throw CompetitorDomainAlreadyExists when the new domain conflicts with an existing competitor in a different case', async () => {
      await createCompetitor();

      const second = await createCompetitor({
        name: 'second competitor',
        domain: 'second.com',
      });

      await expect(
        CompetitorApp.updateCompetitorById({
          id: toGlobalId('Competitor', second.id!),
          domain: 'COMPETITOR.COM',
        })
      ).rejects.toThrow(ErrorCode.CompetitorDomainAlreadyExists);
    });
  });

  describe('deleteCompetitorById', () => {
    it('should delete a competitor and return it', async () => {
      const { id } = await createCompetitor();

      const result = await CompetitorApp.deleteCompetitorById(
        id as CompetitorId
      );

      const competitor = await db<Competitor>('Competitor')
        .where({ id })
        .first();

      expect(competitor).not.toBeDefined();
      expect(result).toMatchObject(DEFAULT_COMPETITOR);
    });
  });

  describe('isOrganizationBlacklisted', () => {
    it('should return false when the competitor table is empty', async () => {
      const org = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      const result = await CompetitorApp.isOrganizationBlacklisted(org);
      expect(result).toBe(false);
    });

    it('should return true when one of the org domains matches a competitor', async () => {
      await createCompetitor({
        domain: TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST,
      });

      const org = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });
      const result = await CompetitorApp.isOrganizationBlacklisted(org);
      expect(result).toBe(true);
    });

    it('should return false when no org domain matches any competitor', async () => {
      await createCompetitor({
        domain: TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST,
      });

      const org = await loadOrganizationBy({
        id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      });
      const result = await CompetitorApp.isOrganizationBlacklisted(org);
      expect(result).toBe(false);
    });
  });
});
