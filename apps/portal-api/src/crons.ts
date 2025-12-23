import cron from 'node-cron';
import { requestContext } from './context/request.context';
import { DeploymentsApp } from './modules/services/deployments/deployments.app';
import { UsersOrganizationApp } from './modules/users/users.organization.app';
import { SYSTEM_USER_CONTEXT } from './portal.const';
import { logApp } from './utils/app-logger.util';

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

export const initCronJobs = () => {
  logApp.info('Initializing cron jobs');
  cron.schedule('0 2 * * *', expireTrials);
  cron.schedule('0 9 * * 1', sendPendingUserDigest);
};
