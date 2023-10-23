// import { Client, Server, ServerOptions } from 'mock-socket';

// import { within } from '@storybook/testing-library';
// import { QueryClient } from '@tanstack/react-query';

// import { DashProvider } from '../../../DashProvider';
// import { createRandomOperator } from '../../../inbox/mocks.test';
// import { defaultRoutes, existingConversationRoutes } from '../../../mswRoutes';
// import LocaleLayout from '../../layout';
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

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       cacheTime: Infinity,
//       staleTime: Infinity,
//     }
//   }
// });

// export const PageView: Story = {
//   parameters: {
//     msw: {
//       handlers: [...existingConversationRoutes, ...defaultRoutes]
//     },
//     nextjs: {
//       navigation: {
//         pathname: '/dash/visitors',
//       },
//     }
//   },
//   render: () => {
//     const props = { overrideQueryProvider: queryClient, mockWsUrl };
//     const mockServer = new Server(mockWsUrl);
//     if (mockServer) {
//       mockServer.on('connection', (socket) => {
//         console.log('test connected!');
//         mockSocket = socket;
//       });
//     }

//     return (
//       <div className='h-screen'>
//         <DashProvider {...props}>
//           <LocaleLayout>
//             <Page></Page>
//           </LocaleLayout>
//         </DashProvider>
//       </div >
//     );
//   },
// }


