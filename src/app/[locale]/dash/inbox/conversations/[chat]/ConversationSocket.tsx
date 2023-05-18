import { FC, useContext } from 'react';
import { AppSocketContext } from '../../../../../../components/AppSocketProvider';

export const ConversationSocket: FC = () => {
  const socket = useContext(AppSocketContext);

  if (!socket) {
    return <></>;
  }

  socket.on('connect', () => {});
};
