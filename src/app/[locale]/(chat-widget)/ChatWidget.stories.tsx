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
import {
  WidgetState, useChatWidgetStore,
} from './(actions)/useChatWidgetStore';
import {
  createRandomConversation,
  createRandomCustomer,
  createRandomMessage,
  createRandomMessages,
  createRandomOperator,
  createRandomOrg,
  loadConfiguration,
  setupTranslation,
} from '../dash/inbox/mocks.test';
import customerConversationItems from 'mocks/customer-conversation-items.json'
import { ChatWidget } from './ChatWidget';

const meta: Meta<typeof ChatWidget> = {
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
const configuration = loadConfiguration(org.orgId);
const lang = 'en';
let mockSocket: Client;

meta.parameters = {
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
      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations*`,
        async (req, res, ctx) => {
          console.log('matched conversations')
          return res(
            ctx.status(200),
            ctx.json(customerConversationItems)
          );
        }
      ),
    ],
  },
};

export const Default: Story = {
  render: () => {
    useChatWidgetStore.setState(
      {chatWidget: 
        {
          ...useChatWidgetStore().chatWidget,
        }
    })
    return (<div className='h-screen'>
      <ChatWidget mockWsUrl={mockWsUrl}></ChatWidget>
      </div>);
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      'Operator sends a new message in existing conversation',
      async () => {
        sessionStorage.removeItem('customerChatStore');
        localStorage.removeItem('customerChatStore');
        useChatWidgetStore.persist.clearStorage();

        const messages = createRandomMessages(
          [
            org.orgId,
            conversation.conversationId,
            operator.operatorId,
            customer.customerId,
          ],
          messageCount
        );

    
        const configuration = loadConfiguration(org.orgId);
        setupTranslation(org.orgId, lang);
        useChatWidgetStore.setState({
          chatWidget: {
            ...useChatWidgetStore().chatWidget,
            org,
            customer,
            conversations: {[conversation.conversationId]: {conversation, operator, messages}},
            configuration,
          },
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
        expect(useChatWidgetStore()?.chatWidget.conversations?.[conversation.conversationId]?.messages?.length).toEqual(
          messageCount + 1
        );
        // check local state is updated
      }
    );
    await step(
      'Operator starts a conversation and sends a message',
      async () => {
        const org = createRandomOrg()
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

        const mockServer = new Server(process.env.NEXT_PUBLIC_APP_WS_URL ?? '');

        mockServer.on('connection', (socket) => {
          socket.send(
            JSON.stringify({
              type: 'eventNewConversation',
              payload: randomConversation,
            })
          );
          socket.send(
            JSON.stringify({
              type: 'eventNewCustomer',
              payload: randomMessage,
            })
          );
        });

        const { widgetState, conversations  } =
          useChatWidgetStore?.().chatWidget

        const {conversation, messages} = conversations[randomConversation.conversationId];
        // check local state is updated
        expect(messages?.length).toEqual(1);
        expect(messages?.pop()).toMatchObject(randomMessage);
        expect(conversation).toMatchObject(randomConversation);
        expect(widgetState).toEqual('chat');
      }
    );
  },
};

