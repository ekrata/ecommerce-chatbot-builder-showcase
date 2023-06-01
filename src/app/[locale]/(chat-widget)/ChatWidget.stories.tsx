import { WebSocketApi } from 'sst/node/api';
import { getWs } from 'packages/functions/app/getWs';
import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { CreateMessage } from '@/entities/entities';
import { rest } from 'msw';
import { WebSocketServer } from 'ws';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';
import {
  createRandomConversation,
  createRandomCustomer,
  createRandomMessage,
  createRandomMessages,
  createRandomOperator,
  createRandomOrg,
} from '../dash/inbox/mocks.test';
import { ChatWidget } from './ChatWidget';

const { url } = WebSocketApi.appWs;

const meta: Meta<typeof ChatWidget> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  component: ChatWidget,
};

export default meta;
type Story = StoryObj<typeof ChatWidget>;
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
    const initialStoreState = useCustomerChatStore.getState();
    useCustomerChatStore.setState({
      org,
      customer,
      operator,
      conversation,
      messages,
    });

    return <ChatWidget />;
  },
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(renderCheck, () => checkRender(canvas));
    await step(
      'Operator sends a new message in existing conversation',
      async () => {
        const { messages } = useCustomerChatStore.getState();
        expect(messages).tohavelength(20);
        const org = createRandomOrg();
        const customer = createRandomCustomer(org.orgId);
        const operator = createRandomOperator(org.orgId);
        const conversation = createRandomConversation(
          'open',
          org.orgId,
          operator.operatorId,
          customer.customerId
        );

        const wss = new WebSocketServer({ port: 8080 });
        wss.on('connection', (ws) => {
          ws.on('error', console.error);

          ws.on('message', (data) => {
            console.log('received: %s', data);
          });
          ws.send(
            JSON.stringify({
              type: 'sendNewMessageToCustomer',
              payload: createRandomMessage(
                org.orgId,
                conversation.conversationId,
                operator.operatorId,
                customer.customerId
              ),
            })
          );
        });

        // check local state is updated
        expect(messages).toHaveLength(messageCount + 1);
      }
    );
    await step(
      'Operator starts a conversation and sends a message',
      async () => {
        const server = new WS(process.env.NEXT_PUBLIC_APP_WS_URL ?? '', {
          jsonProtocol: true,
        });
        await server.connected; // wait for the server to have established the connection
        const org = createRandomOrg();
        const customer = createRandomCustomer(org.orgId);
        const operator = createRandomOperator(org.orgId);
        const randomConversation = createRandomConversation(
          'open',
          org.orgId,
          operator.operatorId,
          customer.customerId
        );
        const randomMessage = createRandomMessage(
          org.orgId,
          randomConversation.conversationId,
          operator.operatorId,
          customer.customerId
        );

        const wss = new WebSocketServer({ port: 8080 });
        wss.on('connection', (ws) => {
          ws.on('error', console.error);

          ws.on('message', (data) => {
            console.log('received: %s', data);
          });
          ws.send(
            JSON.stringify({
              type: 'sendNewConversationToCustomer',
              payload: randomConversation,
            })
          );
          ws.send(
            JSON.stringify({
              type: 'sendNewMessageToCustomer',
              payload: randomMessage,
            })
          );
        });

        const { messages, conversation, widgetState } =
          useCustomerChatStore.getState();
        // check local state is updated
        expect(messages).toHaveLength(1);
        expect(messages?.pop()).toMatchObject(randomMessage);
        expect(conversation).toMatchObject(randomConversation);
        expect(widgetState).toEqual('chat');
      }
    );
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
