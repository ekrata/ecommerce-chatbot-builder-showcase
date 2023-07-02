import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
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
import articleSearchResponse from 'mocks/articleSearchResponse.json'
import articleWithContent from 'mocks/articleWithContent.json'

// import customerConversationItems from 'mocks/'
import { ChatWidget } from './ChatWidget';
import Layout from './layout';
import { getWsUrl } from '@/app/getWsUrl';
import { createRandomConversation, createRandomCustomer, createRandomMessage, createRandomOperator } from '../dash/inbox/mocks.test';
import { useCustomerQuery } from './(hooks)/queries/useCustomerQuery';
import { QueryClient } from '@tanstack/react-query';
import { WidgetProvider } from './WidgetProvider';
import { QueryKey } from './(hooks)/queries';
import { Customer } from '@/entities/customer';
import { ConversationItem, ExpandedConversation } from '@/entities/conversation';

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

const queryClient = new QueryClient({defaultOptions: {queries: {
  cacheTime: Infinity,
  staleTime: Infinity,
}}});

const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
const customer = queryClient.getQueryData<EntityItem<typeof Customer>>([orgId, '', QueryKey.customer]);

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
            ctx.delay(2000),
            ctx.json(configuration)
          );
        }
      ),
      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/:lang/articles/search*`,
        async(req,res,ctx) => {
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json({articleSearchResponse})
          )
        }),
      rest.get(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/:lang/articles/:articleId/with-content`,
        async(req,res,ctx) => {
          return res(
            ctx.status(200),
            ctx.delay(2000),
            ctx.json({articleWithContent})
          )
        }),
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

export const story: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    }
  },
  render: () => {
    // useChatWidgetStore.setState({chatWidget: {...useChatWidgetStore().chatWidget, org: orgs.data[0] as EntityItem<typeof Org>}})
    console.log('hi')
    const props ={overrideQueryProvider: queryClient};
    return (
      <div className='h-screen'>
        <WidgetProvider {...props}>
          <ChatWidget mockWsUrl={mockWsUrl}></ChatWidget>
        </WidgetProvider>
      </div>
      );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      'Operator starts a conversation, and both operator and customer sends messages',
      async () => {
          console.log('hi')
          const mockServer = new Server(mockWsUrl);
          if (mockServer) {
            mockServer.stop();
            mockServer.close();
            mockServer.on('connection', (socket) => {
              console.log('test connected!');
              mockSocket = socket;
            });
          }

          const operator = createRandomOperator(orgId);
          const customer = createRandomCustomer(orgId);
          const conversation = createRandomConversation('unassigned', orgId, operator.operatorId, customer.customerId);
          const expandedConversation: ExpandedConversation = {...conversation, operator, customer};
          const conversationItem: ConversationItem = {conversation: expandedConversation, messages: []};

          mockServer.emit(
            'createNewConversationItem',
            JSON.stringify(conversationItem)
          );

          const conversationItems = queryClient.getQueryData<ConversationItem[]>([orgId, customer.customerId, QueryKey.conversationItems]);
          expect(conversationItems?.length).toEqual(1)
          expect(conversationItems?.[0]).toStrictEqual(conversationItem)
            
          
          const message = createRandomMessage(
            orgId,
            conversation.conversationId,
            operator.operatorId,
            customer.customerId
          )

          mockServer.emit(
            'sendNewMessage',
            JSON.stringify(message)
          );

          expect(conversationItems?.[0].messages?.[0]).toStrictEqual(message);


          // navbar rendered
          (await canvas.findByTestId('navbar-conversations')).click();

          // conversation created and rendered
          (await canvas.findByTestId(conversationItem.conversation.conversationId)).click();

          // conversation has operator's and is rendered
          expect(await canvas.findByTestId(`operator-message-content-${message.messageId}`)).toBeInTheDocument();

          // user responds
          const inputMsg = (await canvas.findByTestId('msg-input'))
          const customerMsgContent = 'Hi, do you sell socks?'
          fireEvent.change(inputMsg, {target: {value: customerMsgContent}});
          (await canvas.findByTestId('sendMsg')).click()

          // conversation has operator's and is rendered
          expect(await canvas.findByTestId(`operator-message-content-${message.messageId}`)).toBeInTheDocument()
          expect(await canvas.findByTestId(`operator-message-content-${message.messageId}`)).toHaveTextContent(customerMsgContent)
          expect(conversationItems?.[0].messages?.length).toEqual(2);

  //       // await new Promise((r) => setTimeout(r, 2000));
        // check local state is updated
      }
    )}
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

