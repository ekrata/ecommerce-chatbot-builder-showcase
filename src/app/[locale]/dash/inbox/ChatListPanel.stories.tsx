import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { ChatListPanel } from './ChatListPanel';
import { createRandomChat } from './mocks';

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
  render: () => {
    const unassignedChats = Array(20).map(() => createRandomChat('unassigned'));
    const openChats = Array(20).map(() => createRandomChat('open'));
    const solvedChats = Array(20).map(() => createRandomChat('solved'));
    return (
      <>
        <button type='button' className='btn btn-primary' />
        <ChatListPanel
          unassignedChats={unassignedChats}
          openChats={openChats}
          solvedChats={solvedChats}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 👇 Simulate interactions with the component
    await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');

    await userEvent.type(canvas.getByTestId('password'), 'a-random-password');

    // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    await userEvent.click(canvas.getByRole('button'));

    // 👇 Assert DOM structure
    // await expect(canvas.getByText('')).toBeInTheDocument();
  },
};

/*
 * See https://storybook.js.org/docs/react/writing-stories/play-function#working-with-the-canvas
 * to learn more about using the canvasElement to query the DOM
 */
export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 👇 Simulate interactions with the component
    await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');

    await userEvent.type(canvas.getByTestId('password'), 'a-random-password');

    // See https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    await userEvent.click(canvas.getByRole('button'));
    // 👇 Assert DOM structure
    // await expect(canvas.getByText('')).toBeInTheDocument();
  },
};
