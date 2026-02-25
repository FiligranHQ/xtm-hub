import { db, paginate } from '../../../../knexfile';
import {
  CompetitorConnection,
  QueryCompetitorsArgs,
} from '../../../__generated__/resolvers-types';
import Competitor, {
  CompetitorInitializer,
  CompetitorMutator,
} from '../../../model/kanel/public/Competitor';

export const CompetitorDomain = {
  async loadCompetitors(opts: QueryCompetitorsArgs) {
    const { first, after, orderBy, orderMode } = opts;
    return paginate<Competitor, CompetitorConnection>('Competitor', {
      first,
      after,
      orderMode,
      orderBy,
    });
  },
  async insertCompetitor(data: CompetitorInitializer): Promise<Competitor> {
    const [createdCompetitor] = await db<Competitor>('Competitor')
      .insert({
        ...data,
        ...(data.domain != null && { domain: data.domain.toLowerCase() }),
      })
      .returning('*');

    return createdCompetitor;
  },

  async updateCompetitorBy(
    field: CompetitorMutator,
    data: CompetitorMutator
  ): Promise<Competitor> {
    const [updatedCompetitor] = await db<Competitor>('Competitor')
      .where(field)
      .update({
        ...data,
        ...(data.domain != null && { domain: data.domain.toLowerCase() }),
      })
      .returning('*');

    return updatedCompetitor;
  },
  async deleteCompetitorBy(field: CompetitorMutator): Promise<Competitor> {
    const [deletedCompetitor] = await db<Competitor>('Competitor')
      .where(field)
      .delete()
      .returning('*');
    return deletedCompetitor;
  },
};
