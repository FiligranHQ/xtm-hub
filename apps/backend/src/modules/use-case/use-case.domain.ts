import { db, paginate } from '../../../knexfile';
import {
  QueryUseCasesArgs,
  UseCaseConnection,
} from '../../__generated__/resolvers-types';
import UseCase, {
  UseCaseId,
  UseCaseInitializer,
  UseCaseMutator,
} from '../../model/kanel/public/UseCase';

export const useCaseDomain = {
  insertUseCase: async (input: UseCaseInitializer): Promise<UseCase> => {
    const [useCase] = await db<UseCase>('UseCase').insert(input).returning('*');
    return useCase;
  },

  updateUseCase: async (
    id: UseCaseId,
    fields: UseCaseMutator
  ): Promise<UseCase> => {
    const [useCase] = await db<UseCase>('UseCase')
      .where({ id })
      .update(fields)
      .returning('*');
    return useCase;
  },

  loadUseCases: (
    opts: Partial<QueryUseCasesArgs>
  ): Promise<UseCaseConnection> => {
    const useCaseQuery = db<UseCase>('UseCase').modify((queryBuilder) => {
      if (opts.documentType) {
        queryBuilder
          .distinct('UseCase.*')
          .innerJoin(
            'Object_UseCase',
            'UseCase.id',
            'Object_UseCase.use_case_id'
          )
          .innerJoin('Document', 'Document.id', 'Object_UseCase.object_id')
          .where('Document.type', opts.documentType);
      }
    });
    return paginate<UseCase, UseCaseConnection>(
      'UseCase',
      opts,
      undefined,
      useCaseQuery
    );
  },

  loadUseCasesByDocumentId: (documentId: string): Promise<UseCase[]> => {
    return db<UseCase>('UseCase')
      .leftJoin('Object_UseCase as ouc', 'ouc.use_case_id', 'UseCase.id')
      .where('ouc.object_id', '=', documentId)
      .returning('UseCase.*');
  },

  loadUseCaseBy: (field: UseCaseMutator): Promise<UseCase | null> => {
    return db<UseCase>('UseCase').where(field).first();
  },

  loadUseCaseByLikeName: (name: string): Promise<UseCase | null> => {
    return db('UseCase').where('name', 'ILIKE', name).select('*').first();
  },

  deleteUseCase: async (field: UseCaseMutator): Promise<UseCase> => {
    const [deletedUseCase] = await db<UseCase>('UseCase')
      .where(field)
      .delete('*');

    return deletedUseCase;
  },
};
