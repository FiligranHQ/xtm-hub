import { NotificationsIcon } from 'filigran-icon';

import { APP_PATH } from '@/utils/path/constant';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export const NotificationButton: React.FC = () => {
  const t = useTranslations();
  const [openPopover, setOpenPopover] = useState(false);

  const users: userList_fragment$data[] = [];

  const nbUsers = 0;

  return (
    <Popover
      open={openPopover}
      onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-9 px-0 relative">
          <NotificationsIcon className="h-4 w-4" />
          {nbUsers > 0 && (
            <span className="absolute top-2 right-2.5 block h-[6px] w-[6px] transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-120 px-0 pt-4 pb-0">
        <span className="px-4">
          {t('Notifications.Title', {
            count: nbUsers,
          })}
        </span>
        <div className="max-h-[300px] overflow-auto mt-4">
          {users.map((user) => (
            <div key={user.id}>
              <Separator className="" />
              <Link
                href={`/${APP_PATH}/manage/user?pendingUsers`}
                onClick={() => setOpenPopover(false)}
                className="flex items-center my-2 px-4">
                <UsersIcon className="mr-4 h-4 w-4 text-gray-300" />
                <div className="">
                  <span className="block text-sm">
                    {t('Notifications.UserNotification.Title')}
                  </span>
                  <span className="block text-xs">
                    {t.rich('Notifications.UserNotification.Text', {
                      nameFormat: (chunk) => (
                        <span className="text-blue">{chunk}</span>
                      ),
                      name: `${user.first_name} ${user.last_name}`,
                    })}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
