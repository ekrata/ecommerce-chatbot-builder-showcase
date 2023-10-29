'use client'

import { getCookie } from 'cookies-next';
import { EntityItem } from 'electrodb';
// Import necessary hooks and libraries
import {
    createContext, PropsWithChildren, useCallback, useContext, useEffect, useState
} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

import { WsAppDetailType } from '@/types/snsTypes';
import { useQueryClient } from '@tanstack/react-query';

import { ConversationItem } from '../../../stacks/entities/conversation';
import { Message } from '../../../stacks/entities/message';
import { Operator } from '../../../stacks/entities/operator';
import { useCreateCustomerMut } from './(actions)/mutations/useCreateCustomerMut';
import { newMessageReducer, useCreateMessageMut } from './(actions)/mutations/useCreateMessageMut';
import { QueryKey } from './(actions)/queries';
import { useConfigurationQuery } from './(actions)/queries/useConfigurationQuery';
import { useCustomerQuery } from './(actions)/queries/useCustomerQuery';
import { useOrgQuery } from './(actions)/queries/useOrgQuery';
import { sortConversationItems } from './(helpers)/sortConversationItems';
import { getWsUrl } from './getWsUrl';

// import { useDashStore } from './(actions)/useDashStore';

// Create a context for chat messages
const WidgetSocketContext = createContext<ReturnType<typeof useWebSocket> | null>(null);
const SOCKET_URL = "ws://localhost:3001";

export interface Props {
    mockWsUrl?: string
}

export const useWidgetSocketContext = () => useContext(WidgetSocketContext)

export const WidgetSockerProvider: React.FC<PropsWithChildren> = ({ children }) => {
    // Initialize the WebSocket connection and retrieve necessary properties
    // const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
    const orgQuery = useOrgQuery()
    const orgId = orgQuery?.data?.orgId ?? ''
    const configuration = useConfigurationQuery(orgId);
    const newCustomerId = uuidv4()
    const createCustomerMut = useCreateCustomerMut(orgId, newCustomerId)
    const { widgetAppearance } = { ...configuration?.data?.channels?.liveChat?.appearance }
    const customer = useCustomerQuery(orgId)
    const [wsUrl, setWsUrl] = useState('');
    // const createCustomerMut = useCreateCustomerMut(orgId, newCustomerId)

    useEffect(() => {
        if (!orgId) {
            orgQuery.refetch()
        }
        if (!customer?.data?.customerId) {
            (async () => await createCustomerMut.mutateAsync([orgId, newCustomerId, { customerId: newCustomerId, orgId }]))()
        }
        if (orgId && customer?.data?.customerId) {
            setWsUrl(getWsUrl(orgId, customer?.data?.customerId, 'customer'))
        }
    }, [orgId, customer?.data?.customerId])

    const ws = useWebSocket(wsUrl, {});
    const { lastMessage } = ws
    // Initialize the queryClient from react-query
    const queryClient = useQueryClient();
    // Check if WebSocket connection is open and ready for sending messages

    // Handle the incoming WebSocket messages
    useEffect(() => {
        if (lastMessage && lastMessage.data) {
            const { type, body } = JSON.parse(lastMessage.data);
            // Update the local chat messages state based on the message type
            console.log(type)
            switch (type) {
                case WsAppDetailType.wsAppCreateConversation:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (data) => {
                        return [...data ?? [], body];
                    });
                    break;
                case WsAppDetailType.wsAppCreateMessage:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        return newMessageReducer(body as EntityItem<typeof Message>, oldData ?? [])
                    });
                    break;
                case WsAppDetailType.wsAppUpdateConversation:
                    queryClient.setQueryData<ConversationItem[]>([orgId, customer?.data?.customerId, QueryKey.conversationItems], (oldData) => {
                        const updatedConversationItem = (body as ConversationItem)
                        const oldMessages = oldData?.find((conversationItem) => conversationItem?.conversationId === updatedConversationItem?.conversationId)?.messages
                        const conversationItems = [...oldData?.filter((conversationItem) => conversationItem?.conversationId !== updatedConversationItem?.conversationId) ?? [], { ...updatedConversationItem, messages: oldMessages }] as ConversationItem[]
                        sortConversationItems(conversationItems)
                        return conversationItems
                    });
                    break;
                case WsAppDetailType.wsAppUpdateOperator:
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
        <WidgetSocketContext.Provider value={ws ?? null}>
            {children}
        </WidgetSocketContext.Provider>
    );
};
