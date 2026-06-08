import { v4 as uuidv4 } from 'uuid';
import {
  Competitor,
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from '../../../__generated__/resolvers-types';
import { CompetitorId } from '../../../model/kanel/public/Competitor';
import Organization from '../../../model/kanel/public/Organization';
import { toError } from '../../../utils/error/error-guard.util';
import { ErrorCode, NotFoundErrorCode } from '../../../utils/error/error.code';
import { AlreadyExistsError } from '../../../utils/error/error.util';
import { omit } from '../../../utils/utils';
import { CompetitorDomain } from './competitor.domain';

const throwIfUniqueViolation = (error: unknown) => {
  const normalizedError = toError(error);
  if (normalizedError.message.includes('competitor_domain_unique')) {
    throw AlreadyExistsError(ErrorCode.CompetitorDomainAlreadyExists, {
      detail: normalizedError,
    });
  }
};

export const CompetitorApp = {
  async insertCompetitor(data: CreateCompetitorInput): Promise<Competitor> {
    try {
      return await CompetitorDomain.insertCompetitor({
        ...data,
        id: uuidv4() as CompetitorId,
      });
    } catch (error) {
      throwIfUniqueViolation(error);
      throw error;
    }
  },
  async updateCompetitorById(data: UpdateCompetitorInput): Promise<Competitor> {
    try {
      const competitor = await CompetitorDomain.updateCompetitorBy(
        { id: data.id },
        { ...omit(data, ['id']) }
      );
      if (!competitor) {
        throw new Error(NotFoundErrorCode.CompetitorNotFound);
      }
      return competitor;
    } catch (error) {
      throwIfUniqueViolation(error);
      throw error;
    }
  },
  async deleteCompetitorById(id: CompetitorId): Promise<Competitor> {
    const competitor = await CompetitorDomain.deleteCompetitorBy({ id });
    if (!competitor) {
      throw new Error(NotFoundErrorCode.CompetitorNotFound);
    }
    return competitor;
  },
  async isOrganizationBlacklisted(
    organization: Organization
  ): Promise<boolean> {
    if (!organization.domains?.length) return false;
    return CompetitorDomain.isAnyDomainACompetitor(organization.domains);
  },
};
