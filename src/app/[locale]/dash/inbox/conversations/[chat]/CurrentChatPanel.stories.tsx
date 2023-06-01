import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { action } from '@storybook/addon-actions';
import { ChatListPanel } from '../../ChatListPanel';
import { createRandomChat, createRandomMessage } from '../../mocks.test';
import { ChatLog } from '../../OperatorChatLog';
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
unassignedChat.messages = [];
const assignedChat = createRandomChat('open');
type Canvas = ReturnType<typeof within>;

const checkRender = (canvas: Canvas) => {
  expect(canvas.getByTestId('current-chat-panel')).toBeInTheDocument();
  expect(canvas.getByTestId('chat-log')).toBeInTheDocument();
};

const renderCheck = 'Render check';

// Initial(No Data)
export const EmptyChatLog: Story = {
  render: () => (
    <>
      <CurrentChatPanel />
    </>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
    await step('View no messages', async () => {
      await expect(canvas.getByTestId('chat-log').childNodes.length === 0);
    });
  },
};

export const PopulatedChatLog: Story = {
  render: () => (
    <>
      <CurrentChatPanel chat={assignedChat} />
    </>
  ),
  play: async ({ canvasElement, step }) => {
    await step('View Messages', async () => {
      const canvas = within(canvasElement);
      await step(renderCheck, () => checkRender(canvas));
      await expect(canvas.getByTestId('chat-log').childNodes.length === 20);
      await unassignedChat.messages.map(async (message) => {
        await expect(canvas.getByText(message.content)).toBeTruthy();
      });
    });
  },
};

const sendingChat = createRandomChat('open');
sendingChat.messages.push(
  createRandomMessage(sendingChat.id, sendingChat.customer.id, true, new Date())
);
export const SendingMessage: Story = {
  render: () => <CurrentChatPanel chat={sendingChat} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
    await step('View Messages', async () => {
      expect(canvas.getByTestId('chat-log').childNodes.length === 20);
      sendingChat.messages.map(async (message) => {
        await expect(canvas.getByText(message.content)).toBeTruthy();
      });
    });

    await step('View user typing message', async () => {
      const lastMessage = within(
        canvas.getByTestId('chat-log')?.lastElementChild as HTMLElement
      );
      expect(lastMessage.findByText('...')).toBeTruthy();
    });
  },
};
