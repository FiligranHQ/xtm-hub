import { v4 as uuidv4 } from 'uuid';
import {
  CreateEpicInput,
  UpdateEpicInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { subscriptionApp } from '../../subcription/subscription.app';
import { UserServiceDomain } from '../../user_service/user_service.domain';
import { loadServiceInstanceBy } from '../service-instance.domain';
import { EpicDomain } from './epic.domain';

export const EpicApp = {
  loadEpics: async () => {
    // Make sure organization has subscription
    const serviceInstance = await loadServiceInstanceBy(
      'name',
      'Public Roadmap'
    );
    const { user } = requestContext.require();
    let subscription;
    try {
      subscription = await subscriptionApp.subscribeOrganizationToService({
        organizationId: user.selected_organization_id,
        serviceInstanceId: serviceInstance.id,
        startDate: new Date(),
        endDate: null,
        capabilityIds: [],
        throwError: false,
      });
    } catch {
      return;
    }

    // Make sure user has user_service
    await UserServiceDomain.addServiceToUsers(subscription, [user.email], []);

    // Load data
    return EpicDomain.loadEpics();
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
