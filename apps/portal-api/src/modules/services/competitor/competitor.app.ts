import config from 'config';
import {
  Competitor,
  CompetitorTier,
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from '../../../__generated__/resolvers-types';
import { CompetitorId } from '../../../model/kanel/public/Competitor';
import Organization from '../../../model/kanel/public/Organization';
import { ErrorCode } from '../../../utils/error/error.code';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { extractId, omit } from '../../../utils/utils';
import { CompetitorDomain } from './competitor.domain';

const throwIfUniqueViolation = (error: Error) => {
  if (error.message?.includes('competitor_domain_unique')) {
    throw AlreadyExistsError(ErrorCode.CompetitorDomainAlreadyExists, {
      detail: error,
    });
  }
};

const isOrganizationBlacklistedFromSettings = (organization: Organization) => {
  const domainsBlacklist = (config.get<string>('domains_blacklist') ?? '')
    .split(',')
    .map((d) => d.trim());
  return organization.domains.some((domain) =>
    domainsBlacklist.includes(domain)
  );
};

export const CompetitorApp = {
  async insertCompetitor(data: CreateCompetitorInput): Promise<Competitor> {
    try {
      const competitor = await CompetitorDomain.insertCompetitor(data);
      return {
        ...competitor,
        tier: competitor.tier as CompetitorTier,
      };
    } catch (error) {
      throwIfUniqueViolation(error);
      throw error;
    }
  },
  async updateCompetitorById(data: UpdateCompetitorInput): Promise<Competitor> {
    try {
      const competitor = await CompetitorDomain.updateCompetitorBy(
        { id: extractId<CompetitorId>(data.id) },
        { ...omit(data, ['id']) }
      );
      return {
        ...competitor,
        tier: competitor.tier as CompetitorTier,
      };
    } catch (error) {
      throwIfUniqueViolation(error);
      throw error;
    }
  },
  async deleteCompetitorById(id: CompetitorId): Promise<Competitor> {
    const competitor = await CompetitorDomain.deleteCompetitorBy({
      id,
    });
    return {
      ...competitor,
      tier: competitor.tier as CompetitorTier,
    };
  },
  async isOrganizationBlacklisted(
    organization: Organization
  ): Promise<boolean> {
    if (!organization.domains?.length) return false;
    return (
      // TODO: check from settings can be removed once we have filled the competitors table
      isOrganizationBlacklistedFromSettings(organization) ||
      CompetitorDomain.isAnyDomainACompetitor(organization.domains)
    );
  },
};
