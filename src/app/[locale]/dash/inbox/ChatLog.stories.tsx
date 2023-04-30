import Image from 'next/image';
import { withTests } from '@storybook/addon-jest';
import { composeStories, setProjectAnnotations } from '@storybook/react';
import type { Meta, Story, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';

import { expect } from '@storybook/jest';
import { ChatLog } from './ChatLog';

const meta: Meta<typeof ChatLog> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatLog,
};
export default meta;
type Story = StoryObj<typeof ChatLog>;

export const EmptyForm: Story = {};

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
    await expect(canvas.getByText('')).toBeInTheDocument();
  },
};
