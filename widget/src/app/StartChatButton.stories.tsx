import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { ComponentProps } from 'react';
import { StartChatButton } from './StartChatButton';

const meta: Meta<typeof StartChatButton> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: StartChatButton,
};

export default meta;
type Story = StoryObj<typeof StartChatButton>;
type Canvas = ReturnType<typeof within>;

const checkRender = (canvas: Canvas) => {
  expect(canvas.getByTestId('start-chat-btn')).toBeInTheDocument();
};

const renderCheck = 'Render check';

// Initial(No Data)
export const DefaultInfo: Story = {
  render: (args: ComponentProps<typeof StartChatButton>) => (
    <StartChatButton {...args} />
  ),
  args: {
    enableButtonLabel: true,
    widgetPosition: 'right',
    backgroundColor:
      'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
    await step('Interact with buttons', async () => {
      await userEvent.click(canvas.getByTestId('start-chat-btn'));
    });
  },
};
