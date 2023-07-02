// Import necessary hooks and libraries
import { PropsWithChildren, createContext, useCallback, useContext, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKey, useConfigurationQuery, useOrgQuery } from "../(hooks)/queries";
import { ConversationItem } from "@/entities/conversation";
import { useCustomerQuery } from "../(hooks)/queries/useCustomerQuery";
import { newMessageReducer } from "../(hooks)/mutations/useCreateMessageMut";
import { EntityItem } from "electrodb";
import { Message } from "@/entities/message";
import { sortConversationItems } from "../(helpers)/sortConversationItems";
import { getWsUrl } from "@/app/getWsUrl";
import { useOperatorsQuery } from "../(hooks)/queries/useOperatorsQuery";
import { Operator } from "@/entities/operator";
import { getCookie } from 'cookies-next';

// Create a context for chat messages
const DashSocketContext = createContext<null>(null);
const SOCKET_URL = "ws://localhost:3001";
export enum WsAppMessageType  {
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

    const sessionOperator: EntityItem<typeof Operator> = JSON.parse(getCookie('session')?.toString() ?? '')
    console.log(sessionOperator)
    const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
    const configuration = useConfigurationQuery(orgId);
    const org = useOrgQuery(orgId)
    const customer = useCustomerQuery(orgId)
    const operators = useOperatorsQuery(orgId, true)

    const operator = operators?.data?.find((operator) => operator.operatorId === sessionOperator?.operatorId ?? '   ')

    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = useWebSocket(mockWsUrl ?? getWsUrl(orgId, operator?.operatorId ?? '', 'operator'), {
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
                    const updatedConversationItem =  (payload as ConversationItem)
                    const conversationItems =  [...oldData?.filter((conversationItem) => conversationItem.conversation.conversationId !== updatedConversationItem.conversation.conversationId) ?? [], updatedConversationItem ]
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