import { Client } from 'mock-socket';
import { v4 as uuidv4 } from 'uuid';

import { within } from '@storybook/testing-library';
import { QueryClient } from '@tanstack/react-query';

import LocaleLayout from '../../../layout';
import { DashProvider } from '../../DashProvider';
import { createRandomOperator } from '../../inbox/mocks.test';
import Layout from '../../layout';
import { defaultRoutes, existingConversationRoutes } from '../../mswRoutes';
import Page from './page';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  }
});

export const UpdateArticle: Story = {
  parameters: {
    msw: {
      handlers: [...existingConversationRoutes, ...defaultRoutes]
    },
    nextjs: {
      navigation: {
        pathname: '/dash/articles/:articleId',
        query: {
          articleId: uuidv4(),
        },
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
    return (
      <div className='h-screen'>
        <LocaleLayout params={{ locale: 'en' }}>
          <Page></Page>
        </LocaleLayout>
      </div >
    );
  },
}

export const CreateArticle: Story = {
  parameters: {
    msw: {
      handlers: [...existingConversationRoutes, ...defaultRoutes]
    },
    nextjs: {
      navigation: {
        pathname: '/dash/articles/:articleId',
        query: {
          articleId: 'new',
        },
      },
    }
  },
  render: () => {
    const props = { overrideQueryProvider: queryClient, mockWsUrl };
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