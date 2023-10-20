'use client'

import { EntityItem } from 'electrodb';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

import { useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { newMessageReducer } from '../../../(hooks)/mutations/useCreateMessageMut';
import { QueryKey, useConfigurationQuery, useOrgQuery } from '../../../(hooks)/queries';
import { useCustomerQuery } from '../../../(hooks)/queries/useCustomerQuery';
import { WsAppMessage } from '../../../../../../packages/functions/app/ws/src/WsMessage';
import { ConversationItem } from '../../../../../../stacks/entities/conversation';
import { Message } from '../../../../../../stacks/entities/message';
import { Operator } from '../../../../../../stacks/entities/operator';
import { getWsUrl } from '../../../../../app/getWsUrl';
import { sortConversationItems } from './(helpers)/sortConversationItems';

// Create a context for chat messages
const ChatMessagesContext = createContext(null);
const SOCKET_URL = "ws://localhost:3001";


// const connectionStatus = {
//     [ReadyState.CONNECTING]: 'Connecting',
//     [ReadyState.OPEN]: 'Open',
//     [ReadyState.CLOSING]: 'Closing',
//     [ReadyState.CLOSED]: 'Closed',
//     [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
//   }[readyState];
// export const queryKey = ["messages"];
``

export interface Props {
    mockWsUrl?: string
}

export const WidgetSockerProvider: React.FC<PropsWithChildren> = ({ children }) => {
    // Initialize the WebSocket connection and retrieve necessary properties
    // const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
    const [user] = useAuthContext()
    const orgId = user?.orgId ?? ''
    const configuration = useConfigurationQuery(orgId);
    const { widgetAppearance } = { ...configuration?.data?.channels?.liveChat?.appearance }
    const org = useOrgQuery(orgId)
    const customer = useCustomerQuery(orgId)
    const newCustomerId = uuidv4()
    // const createCustomerMut = useCreateCustomerMut(orgId, newCustomerId)

    useEffect(() => {
        if (!customer?.data?.customerId) {
            // (async () => await createCustomerMut.mutateAsync([orgId, '', false]))()
        }
    }, [])

    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = useWebSocket(getWsUrl(orgId, customer?.data?.customerId ?? newCustomerId, 'customer'), {
        shouldReconnect: (closeEvent) => true,
        onMessage: (event) => {

        }
    });
    // Initialize the queryClient from react-query
    const queryClient = useQueryClient();
    // Check if WebSocket connection is open and ready for sending messages
    const canSendMessages = readyState === ReadyState.OPEN;

    // Handle the incoming WebSocket messages
    useEffect(() => {
        if (lastMessage && lastMessage.data) {
            const { type, body } = JSON.parse(lastMessage.data);
            // Update the local chat messages state based on the message type
            console.log(type)
            switch (type) {
                case WsAppMessage.createConversation:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], body];
                    });
                    break;
                case WsAppMessage.createMessage:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        return newMessageReducer(body as EntityItem<typeof Message>, oldData ?? [])
                    });
                    break;
                case WsAppMessage.updateConversation:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        const updatedConversationItem = (body as ConversationItem)
                        const conversationItems = [...oldData?.filter((conversationItem) => conversationItem?.conversationId !== updatedConversationItem?.conversationId) ?? [], updatedConversationItem]
                        sortConversationItems(conversationItems)
                        return conversationItems
                    });
                    break;
                case WsAppMessage.updateOperator:
                    queryClient.setQueryData<EntityItem<typeof Operator>[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        const updateOperatorItem = (body as EntityItem<typeof Operator>)
                        const operators = [...oldData?.filter((operator) => operator?.operatorId !== updateOperatorItem?.operatorId) ?? [], updateOperatorItem]
                        return operators
                    });
                default:
                    break;
            }
        }
    }, [lastMessage, lastMessage?.data]);

    // Render the ChatMessagesContext.Provider component and pass the necessary values
    return (
        <ChatMessagesContext.Provider value={null}>
            {children}
        </ChatMessagesContext.Provider>
    );
};

