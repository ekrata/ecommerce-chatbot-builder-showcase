import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { ChatListPanel } from './ChatListPanel';
import { createRandomChat } from './mocks.test';

const meta: Meta<typeof ChatListPanel> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatListPanel,
};
export default meta;
type Story = StoryObj<typeof ChatListPanel>;

// Initial(No Data)
export const EmptyChatList: Story = {
  render: () => (
    <>
      <ChatListPanel unassignedChats={[]} openChats={[]} solvedChats={[]} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 👇 Simulate interactions with the component
    await userEvent.click(canvas.getByTestId('expand-unassigned-chats'));

    await userEvent.click(canvas.getByTestId('expand-open-chats'));

    await userEvent.click(canvas.getByTestId('expand-solved-chats'));
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
  play: async ({ canvasElement, step }) => {
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

      // 👇 Assert DOM structure
    });
  },
};
