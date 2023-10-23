// import { Client, Server } from 'mock-socket';

// import { within } from '@storybook/testing-library';
// import { QueryClient } from '@tanstack/react-query';

// import LocaleLayout from '../../../../layout';
// import { DashProvider } from '../../../DashProvider';
// import { createRandomOperator } from '../../../inbox/mocks.test';
// import { defaultRoutes, existingConversationRoutes } from '../../../mswRoutes';
// import Page from './page';

// import type { Meta, StoryObj } from '@storybook/react';
// const meta: Meta<typeof LocaleLayout> = {
//   component: LocaleLayout,
// };

// export default meta;
// type Story = StoryObj<typeof LocaleLayout>;
// type Canvas = ReturnType<typeof within>;

// const messageCount = 20;
// const mockWsUrl = process.env.NEXT_PUBLIC_APP_WS_URL ?? 'Check .ENV'

// const lang = 'en';
// let mockSocket: Client;
// const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''



// export const PageView: Story = {
//   parameters: {
//     msw: {
//       handlers: [...existingConversationRoutes, ...defaultRoutes]
//     },
//     nextjs: {
//       navigation: {
//         pathname: '/dash/settings/channels/live-chat/appearance',
//       },
//     }
//   },
//   render: () => {
//     return (
//       <div className='h-screen'>
//         <LocaleLayout params={{ locale: 'en' }}>
//           <Page></Page>
//         </LocaleLayout>
//       </div >
//     );
//   },
// }


