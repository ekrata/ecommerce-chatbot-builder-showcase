'use client'
import { getCookie } from 'cookies-next';
import { EntityItem } from 'electrodb';
import { WsAppMessage } from 'packages/functions/app/ws/src/WsMessage';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { getWsUrl } from '@/app/getWsUrl';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { Operator } from '@/entities/operator';
import { useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../(helpers)/sortConversationItems';
import { useAuthContext } from '../(hooks)/AuthProvider';
import { newMessageReducer } from '../(hooks)/mutations/useCreateMessageMut';
import { QueryKey, useConfigurationQuery, useOrgQuery } from '../(hooks)/queries';
import { useCustomerQuery } from '../(hooks)/queries/useCustomerQuery';
import { useOperatorsQuery } from '../(hooks)/queries/useOperatorsQuery';

// Create a context for chat messages
const DashSocketContext = createContext<null | ReturnType<typeof useWebSocket>>(null);
const SOCKET_URL = "ws://localhost:3001";


export interface Props {
    mockWsUrl?: string
}

/**
* Handles websocket messages 
* @date 29/06/2023 - 09:33:11
*
* @param {{ children: any; mockWsUrl: any; }} { children, mockWsUrl }
* @returns {*}
*/
export const DashSocketProvider: React.FC<PropsWithChildren<Props>> = ({ children, mockWsUrl }) => {
    // Initialize the WebSocket connection and retrieve necessary properties
    const [sessionOperator] = useAuthContext()
    const ws = useWebSocket(mockWsUrl ?? getWsUrl(sessionOperator?.orgId ?? '', sessionOperator?.operatorId ?? '', 'operator'), {
        shouldReconnect: (closeEvent) => true,
    });

    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = ws
    // Initialize the queryClient from react-query
    const queryClient = useQueryClient();
    // Check if WebSocket connection is open and ready for sending messages
    const canSendMessages = readyState === ReadyState.OPEN;

    // Handle the incoming WebSocket messages
    useEffect(() => {
        if (lastMessage && lastMessage.data) {
            console.log(lastMessage.data)
            const { type, body } = JSON.parse(lastMessage.data);
            console.log(type, body)
            // Update the local chat messages state based on the message type
            switch (type) {
                case WsAppMessage.createConversation:
                    queryClient.setQueryData<ConversationItem[]>([...body, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], body];
                    });
                    break;
                case WsAppMessage.createMessage:
                    console.log('new message')
                    console.log(body)
                    queryClient.setQueryData<ConversationItem[]>([...body, QueryKey.conversationItems], (oldData) => {
                        console.log('creating message', oldData)
                        return newMessageReducer(body as EntityItem<typeof Message>, oldData ?? [])
                    });
                    break;
                case WsAppMessage.updateConversation:
                    queryClient.setQueryData<ConversationItem[]>([...body, QueryKey.conversationItems], (oldData) => {
                        const updatedConversationItem = (body as ConversationItem)
                        const conversationItems = [...oldData?.filter((conversationItem) => conversationItem?.conversationId !== updatedConversationItem?.conversationId) ?? [], updatedConversationItem]
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
        <DashSocketContext.Provider value={ws}>
            {children}
        </DashSocketContext.Provider >
    );
};

// Define a custom hook to access the chat messages context
export const useDashSocketContext = () => useContext(DashSocketContext);