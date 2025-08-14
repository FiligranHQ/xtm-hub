import { AddUser } from '@/components/admin/user/add-user';
import { AdminAddUser } from '@/components/admin/user/admin-add-user';
import PendingUserList from '@/components/admin/user/pending-user-list';
import UserList from '@/components/admin/user/user-list';
import useAdminPath from '@/hooks/useAdminPath';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { createContext, FunctionComponent, useContext, useState } from 'react';

interface UserListPageProps {
  organization?: string;
}

interface UserListConnectionContextType {
  connectionID: string;
  setConnectionId: (id: string) => void;
}

// Custom hook to use the ConnectionContext
export const getUserListContext = (): UserListConnectionContextType => {
  const context = useContext(UserListContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

const UserListContext = createContext<
  UserListConnectionContextType | undefined
>(undefined);

const UserListPage: FunctionComponent<UserListPageProps> = ({
  organization,
}) => {
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  const isPendingUsersEnabled = useIsFeatureEnabled(FeatureFlag.PENDING_USERS);

  const [connectionID, setConnectionId] = useState<string>('');

  return (
    <UserListContext.Provider value={{ connectionID, setConnectionId }}>
      <div className="flex justify-between">
        <h1>{t('UserListPage.Title')}</h1>
        <div className="col-md-6 text-right">
          {isAdminPath ? <AdminAddUser /> : <AddUser />}
        </div>
      </div>
      {isAdminPath || !isPendingUsersEnabled ? (
        <div className="mt-4">
          <UserList organization={organization} />
        </div>
      ) : (
        <Tabs
          defaultValue="users"
          className="">
          <TabsList>
            <TabsTrigger value="users">
              {t('UserListPage.TabTitle')}
            </TabsTrigger>
            <TabsTrigger value="pendingUsers">
              {t('PendingUserListPage.TabTitle')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UserList organization={organization} />
          </TabsContent>
          <TabsContent value="pendingUsers">
            <PendingUserList organization={organization} />
          </TabsContent>
        </Tabs>
      )}
    </UserListContext.Provider>
  );
};
// Component export
export default UserListPage;
