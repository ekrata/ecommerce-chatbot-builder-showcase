import { PropsWithChildren, useEffect, useMemo } from 'react';
import { WebSocketApi } from 'sst/node/api';
import { shallow } from 'zustand/shallow';
import { getWs } from 'packages/functions/app/getWs';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';

const { url } = WebSocketApi.appWs;

export default function Layout({ children }: PropsWithChildren) {
  const { org, visitor, configuration, customer } = useCustomerChatStore(
    (state) => ({
      org: state.org,
      visitor: state.visitor,
      customer: state.customer,
      configuration: state.configuration,
    }),
    shallow
  );

  const socket = useMemo(
    () =>
      org?.orgId && customer?.customerId
        ? getWs(org?.orgId, customer?.customerId, 'customer')
            .on('sendNewMessageToCustomer')
            .on('sendNewConversationToCustomer')
            .on('sendUpdateConversationToCustomer')
        : undefined,
    [org, customer]
  );

  return (
    <>
      <AppSocketProvider appSocket={socket}>
        <div>{children}</div>
      </AppSocketProvider>
    </>
  );
}
