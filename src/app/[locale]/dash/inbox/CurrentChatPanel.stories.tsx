import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { ChatListPanel } from './ChatListPanel';
import { createRandomChat } from './mocks.test';
import { ChatLog } from './ChatLog';
import { CurrentChatPanel } from './CurrentChatPanel';

const meta: Meta<typeof ChatLog> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatListPanel,
};

export default meta;
type Story = StoryObj<typeof CurrentChatPanel>;
const unassignedChat = createRandomChat('unassigned');

// Initial(No Data)
export const EmptyChatList: Story = {
  render: () => (
    <>
      <CurrentChatPanel chat={unassignedChat} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('current-chat-panel')).toBeInTheDocument();
    expect(canvas.getByTestId('chat-log')).toBeInTheDocument();
  },
};

// Data

export const ChatList: Story = {
  render: () => {
    const unassignedChats = [...Array(20)].map(() =>
      createRandomChat('unassigned')
    );
    const openChats = [...Array(20)].map(() => createRandomChat('open'));
    const solvedChats = [...Array(20)].map(() => createRandomChat('solved'));
    return (
      <>
        <ChatListPanel
          unassignedChats={unassignedChats}
          openChats={openChats}
          solvedChats={solvedChats}
        />
      </>
    );
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open chats', async () => {
      await userEvent.click(canvas.getByTestId('expand-unassigned-chats'));

      await userEvent.click(canvas.getByTestId('expand-open-chats'));

      await userEvent.click(canvas.getByTestId('expand-solved-chats'));
    });

    await step('Open chats', async () => {
      await expect(
        canvas.getByTestId('unassigned-chats').childNodes.length === 20
      );
      await expect(canvas.getByTestId('open-chats').childNodes.length === 20);
      await expect(canvas.getByTestId('solved-chats').childNodes.length === 20);

      expect(window.localStorage.getItem('name')).toBe(newName);
      // 👇 Assert DOM structure
    });
  },
};
