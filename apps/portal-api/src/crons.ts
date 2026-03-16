import cron, { ScheduledTask } from 'node-cron';
import { requestContext } from './context/request.context';
import { DeploymentsApp } from './modules/services/deployments/deployments.app';
import { EpicApp } from './modules/services/public_roadmap/epic.app';
import { UsersOrganizationApp } from './modules/users/users.organization.app';
import { SYSTEM_USER_CONTEXT } from './portal.const';
import { logApp } from './utils/app-logger.util';

const scheduledTasks: ScheduledTask[] = [];

const expireTrials = async (): Promise<void> => {
  logApp.info('Running expireTrials job');
  requestContext.set(SYSTEM_USER_CONTEXT);
  try {
    await DeploymentsApp.expireTrials();
  } catch (error) {
    logApp.error('ExpireTrials job failed:', { error });
  }
};

const sendPendingUserDigest = async (): Promise<void> => {
  logApp.info('Running sendPendingUserDigest job');
  requestContext.set(SYSTEM_USER_CONTEXT);
  try {
    await UsersOrganizationApp.sendPendingUsersDigest();
  } catch (error) {
    logApp.error('SendPendingUserDigest job failed:', { error });
  }
};

const sendPublicRoadmapMonthlyReminder = async (): Promise<void> => {
  logApp.info('Running sendPublicRoadmapMonthlyReminder job');
  requestContext.set(SYSTEM_USER_CONTEXT);
  try {
    await EpicApp.sendPublicRoadmapMonthlyReminder();
  } catch (error) {
    logApp.error('sendPublicRoadmapMonthlyReminder job failed:', { error });
  }
};

export const initCronJobs = () => {
  logApp.info('Initializing cron jobs');
  scheduledTasks.push(cron.schedule('0 2 * * *', expireTrials));
  scheduledTasks.push(cron.schedule('0 9 * * 1', sendPendingUserDigest));
  scheduledTasks.push(
    cron.schedule('0 8 1 * *', sendPublicRoadmapMonthlyReminder)
  );
};

export const stopCronJobs = () => {
  logApp.info('Stopping cron jobs');
  for (const task of scheduledTasks) {
    task.stop();
  }
  scheduledTasks.length = 0;
  logApp.info('Cron jobs stopped');
};
