import Label, {
  LabelInitializer,
  LabelMutator,
} from '../../../model/kanel/public/Label';
import { objectLabelDomain } from '../objectLabel/object-label.domain';
import { labelsDomain } from './labels.domain';

export const labelsApp = {
  loadOrCreateLabel: async ({
    name,
    color = '#0099cc',
  }: LabelInitializer): Promise<Label> => {
    const existing = await labelsDomain.loadLabelByLikeName(name);
    if (existing) {
      return existing;
    }

    return labelsDomain.insertLabel({ name, color });
  },

  deleteLabelBy: async (field: LabelMutator): Promise<Label> => {
    const label = await labelsDomain.loadLabelBy(field);
    await objectLabelDomain.deleteObjectLabelBy({ label_id: label.id });
    return labelsDomain.deleteLabel(field);
  },
};
