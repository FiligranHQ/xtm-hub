import { useRelayEnvironment } from 'react-relay';

export const useConnectionId = (recordName: string) => {
  const environment = useRelayEnvironment();
  const store = environment.getStore();
  const records = store.getSource().toJSON();
  for (const [id, record] of Object.entries(records)) {
    if (record?.__typename === recordName) {
      return id;
    }
  }
  return null;
};
