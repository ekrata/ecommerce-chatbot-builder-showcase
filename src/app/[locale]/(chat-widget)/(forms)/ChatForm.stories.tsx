/** @jest-environment setup-polly-jest/jest-environment-node */
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { CreateMessage } from '@/entities/entities';
import { rest } from 'msw';
import { StoryObj, Meta } from '@storybook/react';
import { ChatForm } from './ChatForm';
import { useCustomerChatStore } from '../(actions)/useCustomerChatStore';
import {
  createDefaultConfiguration,
  createRandomConversation,
  createRandomCustomer,
  createRandomMessages,
  createRandomOperator,
  createRandomOrg,
} from '../../dash/inbox/mocks.test';

const meta: Meta<typeof ChatForm> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatForm,
};

export default meta;
type Story = StoryObj<typeof ChatForm>;
type Canvas = ReturnType<typeof within>;

const checkRender = (canvas: Canvas) => {
  expect(canvas.getByTestId('start-chat-btn')).toBeInTheDocument();
};

const renderCheck = 'Render check';

const messageCount = 20;
// Initial(No Data)
export const Default: Story = {
  render: () => {
    const org = createRandomOrg();
    const customer = createRandomCustomer(org.orgId);
    const operator = createRandomOperator(org.orgId);
    const conversation = createRandomConversation(
      'open',
      org.orgId,
      operator.operatorId,
      customer.customerId
    );
    const messages = createRandomMessages(
      [
        org.orgId,
        conversation.conversationId,
        operator.operatorId,
        customer.customerId,
      ],
      messageCount
    );
    const configuration = createDefaultConfiguration(org.orgId)
    console.log(configuration)
    useCustomerChatStore.setState({
      org,
      customer,
      operator,
      conversation,
      configuration,
      messages,
    });

    return <ChatForm  />;
  },
  args: {
    // backgroundColor: 'bg-gradient-to-r from-sky-300 to-cyan-200',
    // darkBackgroundColor: 'bg-gradient-to-r from-sky-600 to-cyan-400',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
    await step('Error msg', async () => {
      // await userEvent.click(canvas.getByTestId('msg-input'));
      await userEvent.click(canvas.getByTestId('msg-submit'));
      await canvas.getByTestId('msg-error');
    });
    await step('Customer sends a new message', async () => {
      await userEvent.click(canvas.getByTestId('msg-input'));
      const msg = 'test message';
      await userEvent.keyboard(msg);
      await userEvent.click(canvas.getByTestId('msg-submit'));
      // no error
      expect(canvas.getByTestId('msg-error')).toBe(undefined);
      const { messages } = useCustomerChatStore.getState();
      expect(messages).toHaveLength(messageCount + 1);
      expect(messages?.slice(-1)[0].content).toEqual(msg);
    });
  },
};

Default.parameters = {
  msw: {
    handlers: [
      // rest.all(`*`, (req, res, ctx) => {
      //   console.log('hiihihii');
      // }),
      rest.post(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId/messages/:messageId`,
        async (req, res, ctx) => {
          const { orgId, conversationId, messageId } = req.params;
          return res(
            ctx.status(200),
            ctx.json({
              ...((await req?.json()) as CreateMessage),
              conversationId,
              orgId,
              messageId,
            } as EntityItem<typeof Message>)
          );
        }
      ),
    ],
  },
};
