// Import necessary hooks and libraries
import { PropsWithChildren, createContext, useCallback, useContext, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useQueryClient } from "@tanstack/react-query";

// Create a context for chat messages
const ChatMessagesContext = createContext(null);
const SOCKET_URL = "ws://localhost:3001";
const MESSAGE_TYPE = {
    INITIAL_DATA: "INITIAL_DATA",
    SEND_MESSAGE: "SEND_MESSAGE",
    NEW_MESSAGE: "NEW_MESSAGE",
};
export const queryKey = ["messages"];

// Define the ChatMessagesProvider component to provide chat messages context
export const useWidgetSockerProvider: React.FC<PropsWithChildren> = ({ children }) => {
    // Initialize the WebSocket connection and retrieve necessary properties
    const {
        sendMessage: sM,
        lastMessage,
        readyState,
    } = useWebSocket(SOCKET_URL, {
        shouldReconnect: true,
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
                case MESSAGE_TYPE.INITIAL_DATA:
                    queryClient.setQueryData(queryKey, () => {
                        return payload;
                    });
                    break;
                case MESSAGE_TYPE.NEW_MESSAGE:
                    queryClient.setQueryData(queryKey, (oldData) => {
                        return [...oldData, payload];
                    });
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage, queryClient]);

    // Define the sendMessage function to send messages through the WebSocket connection
    const sendMessage = useCallback(
        (content) => {
            if (canSendMessages)
                sM(
                    JSON.stringify({
                        type: MESSAGE_TYPE.SEND_MESSAGE,
                        content,
                    }),
                );
        },
        [canSendMessages, sM],
    );

    // Render the ChatMessagesContext.Provider component and pass the necessary values
    return (
        <ChatMessagesContext.Provider value={{ canSendMessages, sendMessage }}>
            {children}
        </ChatMessagesContext.Provider>
    );
};

// Define a custom hook to access the chat messages context
export const useChatMessagesContext = () => useContext(ChatMessagesContext);