import { useState, createContext, FC, PropsWithChildren } from 'react';
import { io } from 'socket.io-client';
import { WebSocketApi } from 'sst/node/api';

const { url } = WebSocketApi.appWs;

export const AppSocketContext = createContext<ReturnType<typeof io> | null>(
  null
);

export const AppSocketProvider: FC<
  PropsWithChildren<{ socketUrl: string }>
> = ({ socketUrl = url, children }) => {
  const initialState = io(socketUrl, {
    reconnectionDelayMax: 10000,
    auth: {
      token: '123',
    },
    query: {
      // 'my-key': 'my-value',
    },
  });
  const [socket] = useState(initialState);

  return (
    <AppSocketContext.Provider value={socket}>
      {children}
    </AppSocketContext.Provider>
  );
};
