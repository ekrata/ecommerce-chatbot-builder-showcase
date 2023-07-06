import { setCookie } from 'cookies-next';
import { EntityItem } from 'electrodb';
import { Client, Server, ServerOptions } from 'mock-socket';
import articles from 'mocks/articles.json';
import articleSearchResponse from 'mocks/articleSearchResponse.json';
import articleWithContent from 'mocks/articleWithContent.json';
import configuration from 'mocks/configuration.json';
import conversationsOrgSearch from 'mocks/conversationsOrgSearch.json';
import customerConversationItems from 'mocks/customer-conversation-items.json';
import customerConversations from 'mocks/customer-conversations.json';
import customers from 'mocks/customers.json';
import operators from 'mocks/operators.json';
import orgs from 'mocks/orgs.json';
import { DefaultBodyType, MockedRequest, rest, RestHandler } from 'msw';
import { useRouter } from 'next/router';

// import customerConversationItems from 'mocks/'
import { getWsUrl } from '@/app/getWsUrl';
import { ConversationItem, ExpandedConversation } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { CreateConversation, CreateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { within } from '@storybook/testing-library';
import { QueryClient } from '@tanstack/react-query';

import { QueryKey } from '../(hooks)/queries';
import {
    createRandomConversation, createRandomCustomer, createRandomMessage, createRandomOperator
} from '../dash/inbox/mocks.test';
import LocaleLayout from '../layout';
import Page from './conversations/page';
import DashNavbar from './DashNavbar';
import { DashProvider } from './DashProvider';
import Layout from './layout';

import type { Meta, StoryObj } from '@storybook/react';
const meta: Meta<typeof LocaleLayout> = {
  component: LocaleLayout,
};

export default meta;
type Story = StoryObj<typeof LocaleLayout>;
type Canvas = ReturnType<typeof within>;

const messageCount = 20;
const mockWsUrl = process.env.NEXT_PUBLIC_APP_WS_URL ?? 'Check .ENV'

const lang = 'en';
let mockSocket: Client;
const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
setCookie('sessionUser', { ...createRandomOperator(orgId), online: true })


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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  }
});

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
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/customers/:customerId`,
    async (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json(customers.data[0])
      );
    }
  ),
  rest.get(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/operators*`,
    async (req, res, ctx) => {
      console.log('hi')
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json(operators.data ?? [])
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
    async (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json({ articleSearchResponse })
      )
    }),
  rest.get(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/:lang/articles/:articleId/with-content`,
    async (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json({ articleWithContent })
      )
    }),
  rest.get(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/search*`,
    async (req, res, ctx) => {
      console.log(customerConversationItems)
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json({ data: conversationsOrgSearch })
      )
    }
  ),
  rest.get(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId*`,
    async (req, res, ctx) => {
      console.log('get one conversation')
      console.log(customerConversationItems.data[0])
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json({ ...customerConversationItems.data[0] })
      )
    }
  ),
  rest.get(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations*`,
    async (req, res, ctx) => {
      console.log(customerConversationItems)
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json({ ...customerConversationItems })
      )
    }
  ),


  rest.post(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId`,
    async (req, res, ctx) => {
      const { orgId, conversationId, } = req.params
      const createConversation = (await req.json()) as CreateConversation
      return res(
        ctx.status(200),
        ctx.delay(2000),
        ctx.json(({ ...customerConversations.data[0], ...createConversation, orgId, conversationId, }))
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

export const PageView: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    },
    nextjs: {
      navigation: {
        pathname: '/dash',
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
    const mockServer = new Server(mockWsUrl);
    if (mockServer) {
      mockServer.on('connection', (socket) => {
        console.log('test connected!');
        mockSocket = socket;
      });
    }

    return (
      <div className='h-screen'>
        <DashProvider {...props}>
          <Layout>
            <Page></Page>
          </Layout>
        </DashProvider>
      </div >
    );
  },
}


export const ConversationView: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    },
    nextjs: {
      navigation: {
        pathname: '/dash/conversations',
        query: {
          conversationId: 'asdsadj-1323122312',
        },
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
    const mockServer = new Server(mockWsUrl);
    if (mockServer) {
      mockServer.on('connection', (socket) => {
        console.log('test connected!');
        mockSocket = socket;
      });
    }
    // const router = useRouter();
    // router.push('/conversations')
    return (
      <div className='h-screen font-sans'>
        <DashProvider {...props}>
          <Layout>
            <Page></Page>
          </Layout>
        </DashProvider>
      </div>
    );
  }
}

export const ConversationItemView: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dash/conversations',
        query: {
          conversationId: 'asdsadj-1323122312',
        },
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
    const mockServer = new Server(mockWsUrl);
    // const router = useRouter();
    // router.push(`/dash/conversations?conversationId${'asdjasdjsad'}`)
    if (mockServer) {
      mockServer.on('connection', (socket) => {
        console.log('test connected!');
        mockSocket = socket;
      });
    }

    return (
      <div className='h-screen font-sans'>
        <DashProvider {...props}>
          <Layout>
            <Page></Page>
          </Layout>
        </DashProvider>
      </div>
    );
  },
}

export const VisitorsView: Story = {
  parameters: {
    msw: {
      handlers: [...defaultRoutes, ...existingConversationRoutes]
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dash/visitors',
        query: {
          conversationId: 'asdsadj-1323122312',
        },
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
    const mockServer = new Server(mockWsUrl);
    // const router = useRouter();
    // router.push(`/dash/conversations?conversationId${'asdjasdjsad'}`)
    if (mockServer) {
      mockServer.on('connection', (socket) => {
        console.log('test connected!');
        mockSocket = socket;
      });
    }

    return (
      <div className='h-screen font-sans'>
        <DashProvider {...props}>
          <Layout>
            <Page></Page>
          </Layout>
        </DashProvider>
      </div>
    );
  },
}

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