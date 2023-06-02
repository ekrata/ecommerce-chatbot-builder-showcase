import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { CreateMessage } from '@/entities/entities';
import { rest } from 'msw';
import { WebSocketServer } from 'ws';
import { Client, Server, ServerOptions } from 'mock-socket';
import { getWsUrl } from '@/app/getWsUrl';
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

const messageCount = 20;
const mockWsUrl = 'ws://localhost:8080';
const mockServer: Server = new Server(mockWsUrl);
const org = createRandomOrg();
const customer = createRandomCustomer(org.orgId);
const operator = createRandomOperator(org.orgId);
const conversation = createRandomConversation(
  'open',
  org.orgId,
  operator.operatorId,
  customer.customerId
);
let mockSocket: Client;
// Initial(No Data)
export const Default: Story = {
  render: () => <ChatWidget mockWsUrl={mockWsUrl} />,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      'Operator sends a new message in existing conversation',
      async () => {
        sessionStorage.removeItem('customerChatStore');
        localStorage.removeItem('customerChatStore');
        useCustomerChatStore.persist.clearStorage();

        const messages = createRandomMessages(
          [
            org.orgId,
            conversation.conversationId,
            operator.operatorId,
            customer.customerId,
          ],
          messageCount
        );
        useCustomerChatStore.setState(
          {
            org,
            customer,
            operator,
            conversation,
            messages,
          },
          true
        );
        expect(messages?.length).toEqual(20);
        // if (mockServer) {
        //   // mockServer.stop();
        //   // mockServer.close();
        //   // getWsUrl(org.orgId, customer.customerId, 'customer')
        //   mockServer.on('connection', (socket) => {
        //     // console.log('connected!');
        //     // mockSocket = socket;
        //   });
        // }
        mockServer.emit(
          'sendNewMessageToCustomer',
          JSON.stringify({
            message: createRandomMessage(
              org.orgId,
              conversation.conversationId,
              operator.operatorId,
              customer.customerId
            ),
          })
        );
        // await new Promise((r) => setTimeout(r, 2000));
        expect(useCustomerChatStore.getState()?.messages?.length).toEqual(
          messageCount + 1
        );
        // check local state is updated
      }
    );
    // await step(
    //   'Operator starts a conversation and sends a message',
    //   async () => {
    //     const org = createRandomOrg();
    //     const customer = createRandomCustomer(org.orgId);
    //     const operator = createRandomOperator(org.orgId);
    //     const randomConversation = createRandomConversation(
    //       'open',
    //       org.orgId,
    //       operator.operatorId,
    //       customer.customerId
    //     );
    //     const randomMessage = createRandomMessage(
    //       org.orgId,
    //       randomConversation.conversationId,
    //       operator.operatorId,
    //       customer.customerId
    //     );

    //     const mockServer = new Server(process.env.NEXT_PUBLIC_APP_WS_URL ?? '');

    //     mockServer.on('connection', (socket) => {
    //       socket.send(
    //         JSON.stringify({
    //           type: 'sendNewConversationToCustomer',
    //           payload: randomConversation,
    //         })
    //       );
    //       socket.send(
    //         JSON.stringify({
    //           type: 'sendNewMessageToCustomer',
    //           payload: randomMessage,
    //         })
    //       );
    //     });

    //     const { messages, conversation, widgetState } =
    //       useCustomerChatStore.getState();
    //     // check local state is updated
    //     expect(messages?.length).toEqual(1);
    //     expect(messages?.pop()).toMatchObject(randomMessage);
    //     expect(conversation).toMatchObject(randomConversation);
    //     expect(widgetState).toEqual('chat');
    //   }
    // );
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
