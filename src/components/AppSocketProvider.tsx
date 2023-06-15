import { useState, createContext, FC, PropsWithChildren } from 'react';

export const AppSocketContext = createContext<WebSocket |undefined>(undefined);

export const AppSocketProvider: FC<
  PropsWithChildren<{ appSocket: WebSocket | undefined }>
> = ({ appSocket, children }) => {
  const initialState = appSocket;
  const [socket] = useState(initialState);

  return (
    <AppSocketContext.Provider value={socket}>
      {children}
    </AppSocketContext.Provider>
  );
};
