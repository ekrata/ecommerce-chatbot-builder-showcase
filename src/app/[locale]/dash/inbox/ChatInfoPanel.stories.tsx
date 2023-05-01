import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { ChatListPanel } from './ChatListPanel';
import { createRandomChat } from './mocks.test';
import { ChatLog } from './ChatLog';
import { ChatInfoPanel } from './ChatInfoPanel';

const meta: Meta<typeof ChatLog> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatListPanel,
};

export default meta;
type Story = StoryObj<typeof ChatInfoPanel>;
const unassignedChat = createRandomChat('unassigned');
type Canvas = ReturnType<typeof within>;

const checkRender = (canvas: Canvas) => {
  expect(canvas.getByTestId('chat-info-panel')).toBeInTheDocument();
};

const renderCheck = 'Render check';

// Initial(No Data)
export const EmptyChatLog: Story = {
  render: () => (
    <>
      <ChatInfoPanel chat={unassignedChat} />
    </>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
  },
};
