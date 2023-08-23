'use client'

import { EntityItem } from 'electrodb';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { getWsUrl } from '@/app/getWsUrl';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { useQueryClient } from '@tanstack/react-query';

import { newMessageReducer } from '../(hooks)/mutations/useCreateMessageMut';
import { QueryKey, useConfigurationQuery, useOrgQuery } from '../(hooks)/queries';
import { useCustomerQuery } from '../(hooks)/queries/useCustomerQuery';
import { sortConversationItems } from './(helpers)/sortConversationItems';

// Create a context for chat messages
const ChatMessagesContext = createContext(null);
const SOCKET_URL = "ws://localhost:3001";
export enum WsAppMessageType {
    // INITIAL_DATA: "eventNewMessage",
    eventNewMessage = "eventNewMessage",
    eventNewConversationItem = "eventNewConversationItem",
    eventUpdateConversationItem = "eventUpdateConversationItem",
};

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

export const WidgetSockerProvider: React.FC<PropsWithChildren> = ({ children, mockWsUrl }) => {
    // Initialize the WebSocket connection and retrieve necessary properties
    const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
    const configuration = useConfigurationQuery(orgId);
    const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
    const org = useOrgQuery(orgId)
    const customer = useCustomerQuery(orgId)

    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = useWebSocket(mockWsUrl ?? getWsUrl(orgId, customer.data?.customerId ?? '', 'customer'), {
        shouldReconnect: (closeEvent) => true,
    });
    // Initialize the queryClient from react-query
    const queryClient = useQueryClient();
    // Check if WebSocket connection is open and ready for sending messages
    const canSendMessages = readyState === ReadyState.OPEN;

    // Handle the incoming WebSocket messages
    useEffect(() => {
        if (lastMessage && lastMessage.data) {
            const { type, payload } = JSON.parse(lastMessage.data);
            // Update the local chat messages state based on the message type
            switch (type) {
                case WsAppMessageType.eventNewConversationItem:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], payload];
                    });
                    break;
                case WsAppMessageType.eventNewMessage:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        return newMessageReducer(payload as EntityItem<typeof Message>, oldData ?? [])
                    });
                    break;
                case WsAppMessageType.eventUpdateConversationItem:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        const updatedConversationItem = (payload as ConversationItem)
                        const conversationItems = [...oldData?.filter((conversationItem) => conversationItem.conversation.conversationId !== updatedConversationItem.conversation.conversationId) ?? [], updatedConversationItem]
                        sortConversationItems(conversationItems)
                        return conversationItems
                    });
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage, lastMessage?.data]);

    // Define the sendMessage function to send messages through the WebSocket connection
    // const sendMessage = useCallback(
    //     (content) => {
    //         if (canSendMessages)
    //             sM(
    //                 JSON.stringify({
    //                     type: MESSAGE_TYPE.SEND_MESSAGE,
    //                     content,
    //                 }),
    //             );
    //     },
    //     [canSendMessages, sM],
    // );

    // Render the ChatMessagesContext.Provider component and pass the necessary values
    return (
        <ChatMessagesContext.Provider value={null}>
            {children}
        </ChatMessagesContext.Provider>
    );
};

// Define a custom hook to access the chat messages context
export const useWidgetSocketContext = () => useContext(null);