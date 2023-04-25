'use client';

import ChatLog from './ChatLog';
import MessageBox from './MessageBox';

export default function ChatListPanel() {
  // t = useTranslations('layout');

  return (
    <div>
      <ChatLog />
      <MessageBox />
    </div>
  );
}
