import { v4 as uuidv4 } from 'uuid';
import {
  CreateEpicInput,
  EpicConnection,
  QueryEpicsArgs,
  UpdateEpicInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { EpicDomain } from './epic.domain';

export const EpicApp = {
  loadEpics: async (opts: Partial<QueryEpicsArgs>): Promise<EpicConnection> => {
    // Load data
    return EpicDomain.loadEpics(opts);
  },
  createEpic: async (input: CreateEpicInput): Promise<Epic> => {
    const { user } = requestContext.require();
    const epicData: Partial<Epic> = {
      ...input,
      id: uuidv4() as EpicId,
      uploader_id: user.id,
      created_at: new Date(),
    };
    return EpicDomain.createEpic(epicData);
  },
  updateEpic: async (id: EpicId, input: UpdateEpicInput) => {
    const { user } = requestContext.require();
    const epicData: Partial<Epic> = {
      ...input,
      id: uuidv4() as EpicId,
      updater_id: user.id,
      updated_at: new Date(),
    };
    return EpicDomain.updateEpic(id, epicData);
  },
  deleteEpic: async (id: EpicId) => {
    const [epics] = await EpicDomain.loadEpicsBy({ id: id });
    await EpicDomain.deleteEpicBy({ id });
    return epics;
  },
};
