'use client'
import { EntityItem } from 'electrodb';
import { WsAppMessage } from 'packages/functions/app/ws/src/WsMessage';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { getWsUrl } from '@/app/getWsUrl';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { InfiniteData, UseInfiniteQueryResult, useQueryClient } from '@tanstack/react-query';

import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { newMessageReducer } from '../../(hooks)/mutations/useCreateMessageMut';
import { QueryKey } from '../../(hooks)/queries';
import { useDashStore } from './(actions)/useDashStore';

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
    const { conversationListFilter } = useDashStore()
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
            const { type, body } = JSON.parse(lastMessage.data);
            // Update the local chat messages state based on the message type
            switch (type) {
                case WsAppMessage.createConversation:
                    queryClient.setQueryData<InfiniteData<{
                        cursor: string | null;
                        data: ConversationItem[];
                    }> | undefined>([...body, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], body];
                    });
                    break;
                case WsAppMessage.createMessage:
                    console.log(Object.values(conversationListFilter))
                    queryClient.setQueryData<InfiniteData<{
                        cursor: string | null;
                        data: ConversationItem[];
                    }> | undefined>([QueryKey.conversationItems, ...Object.values(conversationListFilter)], (oldData) => {
                        const pageNumber = oldData?.pages.findIndex((data) => data?.data?.some((conversationItem) => conversationItem?.conversationId === body?.conversationId))
                        if (pageNumber != null && oldData?.pages[pageNumber]?.data) {
                            console.log('reducing message')
                            oldData.pages[pageNumber].data = newMessageReducer(body as EntityItem<typeof Message>, oldData?.pages[pageNumber].data)
                            return { ...oldData }
                        }
                        return { ...oldData }
                    });
                    const queryData = queryClient.getQueryData<{ cursor: string | null, data: ConversationItem[] }>([QueryKey.conversationItems, ...Object.values(conversationListFilter)])
                    console.log(queryData)
                    break;
                case WsAppMessage.updateConversation:
                    queryClient.setQueryData<InfiniteData<{
                        cursor: string | null;
                        data: ConversationItem[];
                    }>>([QueryKey.conversationItems, ...Object.values(conversationListFilter)], (oldData) => {
                        const updatedConversationItem = (body as ConversationItem)
                        const pageNumber = oldData?.pages.findIndex((data) => data?.data?.some((conversationItem) => conversationItem?.conversationId === body?.conversationId))
                        if (pageNumber && oldData?.pages?.[pageNumber]?.data) {
                            const unUpdatedData = oldData.pages?.[pageNumber].data.filter((conversationItem) => conversationItem?.conversationId !== updatedConversationItem?.conversationId)
                            const existingConversationItem = oldData.pages?.[pageNumber].data.find((conversationItem) => conversationItem.conversationId === updatedConversationItem?.conversationId)
                            const mergedConversationItem: ConversationItem = { ...existingConversationItem, ...updatedConversationItem, messages: existingConversationItem?.messages ?? [] }
                            const conversationItems = [mergedConversationItem, ...(unUpdatedData ?? [])]
                            sortConversationItems(conversationItems)
                            oldData.pages[pageNumber].data = conversationItems
                            return { ...oldData }
                        }
                        return { ...oldData }
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