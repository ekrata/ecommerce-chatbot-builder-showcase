import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { EntityItem } from 'electrodb';
import { Message } from '@/entities/message';
import { CreateConversation, CreateMessage } from '@/entities/entities';
import { DefaultBodyType, MockedRequest, RestHandler, rest } from 'msw';
import { WebSocketServer } from 'ws';
import { Client, Server, ServerOptions } from 'mock-socket';
import customerConversationItems from 'mocks/customer-conversation-items.json'
import customerConversations from 'mocks/customer-conversations.json'
import orgs from 'mocks/orgs.json'
import articles from 'mocks/articles.json'
import configuration from 'mocks/configuration.json'
import conversations from 'mocks/conversations.json'
// import customerConversationItems from 'mocks/'
import { ChatWidget } from './ChatWidget';
import { useEffect } from 'react';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';
import { Org } from '@/entities/org';
import Layout from './layout';

import { createRandomConversation } from '../dash/inbox/mocks.test';
import { ConversationItem } from '@/entities/conversation';
import { createConversation } from './(actions)/conversations/createConversation';

const meta: Meta<typeof ChatWidget> = {
  component: ChatWidget,
};

export default meta;
type Story = StoryObj<typeof ChatWidget>;
type Canvas = ReturnType<typeof within>;

const messageCount = 20;
const mockWsUrl = 'ws://localhost:8080';
const mockServer: Server = new Server(mockWsUrl);
const lang = 'en';
let mockSocket: Client;

const existingConversationRoutes: RestHandler<MockedRequest<DefaultBodyType>>[] = [
  rest.get(
  `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations*`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(2000),
      ctx.json(customerConversationItems.data)
    );
  }
)]

const defaultRoutes: RestHandler<MockedRequest<DefaultBodyType>>[] = [

      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId`,
        async (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json(orgs.data[0])
          );
        }
      ),
      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/lang/:lang/articles`,
        async (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json(articles.data)
          );
        }
      ),
      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/configuration`,
        async (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(configuration)
          );
        }
      ),
      
      rest.post(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId`,
        async (req, res, ctx) => {
          const {orgId, conversationId, } = req.params
          const createConversation = (await req.json()) as CreateConversation
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json(({...customerConversations.data[0], ...createConversation, orgId, conversationId, }))
          )
        }
      ),
      rest.post(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId/messages/:messageId`,
        async (req, res, ctx) => {
          console.log('createMessage')
          const { orgId, conversationId, messageId } = req.params;
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json({
              ...((await req?.json()) as CreateMessage),
              conversationId,
              orgId,
              messageId,
            } as EntityItem<typeof Message>)
          );
        }
      ),
    ]

export const NewCustomer: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes]
    }
  },
  render: () => {
    // useChatWidgetStore.setState({chatWidget: {...useChatWidgetStore().chatWidget, org: orgs.data[0] as EntityItem<typeof Org>}})
    return (<div className='h-screen'>
      <Layout>
        <ChatWidget mockWsUrl={mockWsUrl}></ChatWidget>
      </Layout>
      </div>);
  }
}

export const PreviousCustomerWithConversations: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    }
  },
  render: () => {
    // useChatWidgetStore.setState({chatWidget: {...useChatWidgetStore().chatWidget, org: orgs.data[0] as EntityItem<typeof Org>}})
    return (
      <div className='h-screen'>
        <Layout>
          <ChatWidget mockWsUrl={mockWsUrl}></ChatWidget>
        </Layout>
      </div>
      );
  },

  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(canvasElement);
  //   await step(
  //     'Operator sends a new message in existing conversation',
  //     async () => {
  //       sessionStorage.removeItem('customerChatStore');
  //       localStorage.removeItem('customerChatStore');
  //       useChatWidgetStore.persist.clearStorage();

  //       const messages = createRandomMessages(
  //         [
  //           org.orgId,
  //           conversation.conversationId,
  //           operator.operatorId,
  //           customer.customerId,
  //         ],
  //         messageCount
  //       );

    
  //       const configuration = loadConfiguration(org.orgId);
  //       setupTranslation(org.orgId, lang);
  //       useChatWidgetStore.setState({
  //         chatWidget: {
  //           ...useChatWidgetStore().chatWidget,
  //           org,
  //           customer,
  //           conversations: {[conversation.conversationId]: {conversation, operator, messages}},
  //           configuration,
  //         },
  //         }, 
  //         true
  //       );
  //       expect(messages?.length).toEqual(20);
  //       // if (mockServer) {
  //       //   // mockServer.stop();
  //       //   // mockServer.close();
  //       //   // getWsUrl(org.orgId, customer.customerId, 'customer')
  //       //   mockServer.on('connection', (socket) => {
  //       //     // console.log('connected!');
  //       //     // mockSocket = socket;
  //       //   });
  //       // }
  //       mockServer.emit(
  //         'sendNewMessageToCustomer',
  //         JSON.stringify({
  //           message: createRandomMessage(
  //             org.orgId,
  //             conversation.conversationId,
  //             operator.operatorId,
  //             customer.customerId
  //           ),
  //         })
  //       );
  //       // await new Promise((r) => setTimeout(r, 2000));
  //       expect(useChatWidgetStore()?.chatWidget.conversations?.[conversation.conversationId]?.messages?.length).toEqual(
  //         messageCount + 1
  //       );
  //       // check local state is updated
  //     }
  //   );
  //   await step(
  //     'Operator starts a conversation and sends a message',
  //     async () => {
  //       const org = createRandomOrg()
  //       const customer = createRandomCustomer(org.orgId);
  //       const operator = createRandomOperator(org.orgId);
  //       const randomConversation = createRandomConversation(
  //         'open',
  //         org.orgId,
  //         operator.operatorId,
  //         customer.customerId
  //       );
  //       const randomMessage = createRandomMessage(
  //         org.orgId,
  //         randomConversation.conversationId,
  //         operator.operatorId,
  //         customer.customerId
  //       );

  //       const mockServer = new Server(process.env.NEXT_PUBLIC_APP_WS_URL ?? '');

  //       mockServer.on('connection', (socket) => {
  //         socket.send(
  //           JSON.stringify({
  //             type: 'eventNewConversation',
  //             payload: randomConversation,
  //           })
  //         );
  //         socket.send(
  //           JSON.stringify({
  //             type: 'eventNewCustomer',
  //             payload: randomMessage,
  //           })
  //         );
  //       });

  //       const { widgetState, conversations  } =
  //         useChatWidgetStore?.().chatWidget

  //       const {conversation, messages} = conversations[randomConversation.conversationId];
  //       // check local state is updated
  //       expect(messages?.length).toEqual(1);
  //       expect(messages?.pop()).toMatchObject(randomMessage);
  //       expect(conversation).toMatchObject(randomConversation);
  //       expect(widgetState).toEqual('chat');
  //     }
  //   );
  // },
};

