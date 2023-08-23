import { Client, Server } from 'mock-socket';

import { setOperatorSession } from '@/app/[locale]/(helpers)/useOperatorSession';
import { within } from '@storybook/testing-library';
import { QueryClient } from '@tanstack/react-query';

import { createRandomOperator } from '../../../../../dash/inbox/mocks.test';
import { DashProvider } from '../../../../DashProvider';
import { defaultRoutes, existingConversationRoutes } from '../../../../mswRoutes';
import LocaleLayout from '../../../layout';
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
const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
setOperatorSession({ ...createRandomOperator(orgId), online: true })



export const PageView: Story = {
  parameters: {
    msw: {
      handlers: [...existingConversationRoutes, ...defaultRoutes]
    },
    nextjs: {
      navigation: {
        pathname: '/dash/settings/channels/live-chat/appearance',
      },
    }
  },
  render: () => {
    return (
      <div className='h-screen'>
        <DashProvider>
          <LocaleLayout>
            <Page></Page>
          </LocaleLayout>
        </DashProvider>
      </div >
    );
  },
}


