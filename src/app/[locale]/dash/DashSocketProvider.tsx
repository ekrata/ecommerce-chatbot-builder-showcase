import { getCookie } from 'cookies-next';
import { EntityItem } from 'electrodb';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { getWsUrl } from '@/app/getWsUrl';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { Operator } from '@/entities/operator';
import { useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../(helpers)/sortConversationItems';
import { useOperatorSession } from '../(helpers)/useOperatorSession';
import { newMessageReducer } from '../(hooks)/mutations/useCreateMessageMut';
import { QueryKey, useConfigurationQuery, useOrgQuery } from '../(hooks)/queries';
import { useCustomerQuery } from '../(hooks)/queries/useCustomerQuery';
import { useOperatorsQuery } from '../(hooks)/queries/useOperatorsQuery';

// Create a context for chat messages
const DashSocketContext = createContext<null>(null);
const SOCKET_URL = "ws://localhost:3001";
export enum WsAppMessageType {
    // INITIAL_DATA: "eventNewMessage",
    eventNewMessage = "eventNewMessage",
    eventNewConversationItem = "eventNewConversationItem",
    eventUpdateConversationItem = "eventUpdateConversationItem",
    eventNewCustomer = 'eventNewCustomer',
    eventUpdateCustomer = 'eventUpdateCustomer',
    eventUpdateOperator = 'eventUpdateOperator'
    // eventNewOperator = 'eventNewOperator'
};



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
    const sessionOperator = useOperatorSession();
    const operators = useOperatorsQuery(sessionOperator.orgId, true)

    const operator = operators?.data?.find((operator) => operator.operatorId === sessionOperator?.operatorId ?? '   ')

    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = useWebSocket(mockWsUrl ?? getWsUrl(sessionOperator.orgId, operator?.operatorId ?? '', 'operator'), {
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
                    queryClient.setQueryData<ConversationItem[]>([...payload, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], payload];
                    });
                    break;
                case WsAppMessageType.eventNewMessage:
                    queryClient.setQueryData<ConversationItem[]>([...payload, QueryKey.conversationItems], (oldData) => {
                        return newMessageReducer(payload as EntityItem<typeof Message>, oldData ?? [])
                    });
                    break;
                case WsAppMessageType.eventUpdateConversationItem:
                    queryClient.setQueryData<ConversationItem[]>([...payload, QueryKey.conversationItems], (oldData) => {
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
        <DashSocketContext.Provider value={null}>
            {children}
        </DashSocketContext.Provider>
    );
};

// Define a custom hook to access the chat messages context
export const useDashSocketContext = () => useContext(DashSocketContext);