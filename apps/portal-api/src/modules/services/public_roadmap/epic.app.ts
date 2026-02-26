import { EpicDomain } from './epic.domain';

export const EpicApp = {
  loadEpics: async () => {
    return EpicDomain.loadEpics() ?? [];
  },
};
