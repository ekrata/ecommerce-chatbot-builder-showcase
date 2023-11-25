'use client'
import { EntityItem } from 'electrodb';
// Import necessary hooks and libraries
import { createContext, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { getWsUrl } from '@/src/app/getWsUrl';
import { WsAppDetailType } from '@/types/snsTypes';
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
                case WsAppDetailType.wsAppCreateConversation:
                    queryClient.setQueryData<{ cursor?: string, data: ConversationItem[] } | undefined>([...(body ?? {}), QueryKey.conversationItems], (data) => {
                        return { cursor: data?.cursor, data: [...(data?.data ?? []), body] } as any;
                    });
                    break;
                case WsAppDetailType.wsAppCreateMessage:
                    console.log(Object.values(conversationListFilter))
                    queryClient.setQueryData<{ cursor?: string, data: ConversationItem[] } | undefined>([QueryKey.conversationItems, ...Object.values(conversationListFilter)], (oldData) => {
                        const oldConversationItem = oldData?.data.find((conversationItem) => conversationItem?.conversationId === body?.conversationId)
                        if (oldConversationItem) {
                            console.log('reducing message')
                            return { cursor: oldData?.cursor, data: newMessageReducer(body as EntityItem<typeof Message>, oldData?.data ?? []) }
                        }
                        return oldData
                    });
                    const queryData = queryClient.getQueryData<{ cursor: string | null, data: ConversationItem[] }>([QueryKey.conversationItems, ...Object.values(conversationListFilter)])
                    console.log(queryData)
                    break;
                case WsAppDetailType.wsAppUpdateConversation:
                    queryClient.setQueryData<{ cursor?: string, data: ConversationItem[] } | undefined>([QueryKey.conversationItems, ...Object.values(conversationListFilter)], (oldData) => {
                        const updatedConversationItem = (body as ConversationItem)
                        // const pageNumber = oldData?.pages.findIndex((data) => data?.data?.some((conversationItem) => conversationItem?.conversationId === body?.conversationId))
                        const unUpdatedData = oldData?.data.filter((conversationItem) => conversationItem?.conversationId !== updatedConversationItem?.conversationId)
                        const existingConversationItem = oldData?.data.find((conversationItem) => conversationItem.conversationId === updatedConversationItem?.conversationId)
                        const mergedConversationItem: ConversationItem = { ...existingConversationItem, ...updatedConversationItem, messages: existingConversationItem?.messages ?? [] }
                        const conversationItems = [mergedConversationItem, ...(unUpdatedData ?? [])]
                        sortConversationItems(conversationItems)
                        return { cursor: oldData?.cursor, data: conversationItems }
                    });
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