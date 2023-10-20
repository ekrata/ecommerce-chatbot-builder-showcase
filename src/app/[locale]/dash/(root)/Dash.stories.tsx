import { EntityItem } from 'electrodb';
import { Client, Server, ServerOptions } from 'mock-socket';

// import customerConversationItems from 'mocks/'
import { within } from '@storybook/testing-library';
import { QueryClient } from '@tanstack/react-query';

import LocaleLayout from '../layout';
import Page from './conversations/page';
import { DashProvider } from './DashProvider';
import { createRandomOperator } from './inbox/mocks.test';
import Layout from './layout';
import { defaultRoutes, existingConversationRoutes } from './mswRoutes';

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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  },
});



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
        <LocaleLayout params={{ locale: 'en' }}>
          <Page></Page>
        </LocaleLayout>
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