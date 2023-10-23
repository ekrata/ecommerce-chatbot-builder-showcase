// import { EntityItem } from 'electrodb';
// import articles from 'mocks/articles.json';
// import articleSearchResponse from 'mocks/articleSearchResponse.json';
// import articleWithContent from 'mocks/articleWithContent.json';
// import configuration from 'mocks/configuration.json';
// import conversationsOrgSearch from 'mocks/conversationsOrgSearch.json';
// import customerConversationItems from 'mocks/customer-conversation-items.json';
// import customerConversations from 'mocks/customer-conversations.json';
// import customers from 'mocks/customers.json';
// import operators from 'mocks/operators.json';
// import orgs from 'mocks/orgs.json';
// import translation from 'mocks/translation.json';
// import visits from 'mocks/visits.json';
// import { DefaultBodyType, MockedRequest, rest, RestHandler } from 'msw';

// import { CreateConversation, CreateMessage } from '@/entities/entities';
// import { Message } from '@/entities/message';
// import { QueryClient } from '@tanstack/react-query';

// export const existingConversationRoutes: RestHandler<
//   MockedRequest<DefaultBodyType>
// >[] = [
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations*`,
//     async (req, res, ctx) => {
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json(customerConversationItems.data),
//       );
//     },
//   ),
// ];

// export const defaultRoutes: RestHandler<MockedRequest<DefaultBodyType>>[] = [
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(orgs.data[0]));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/articles/:articleid`,
//     async (req, res, ctx) => {
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json(articleWithContent),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/translations/:lang`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(translation));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/customers/:customerId`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(customers.data[0]));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/customers*`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(customers));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/visits*`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(visits));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/operators*`,
//     async (req, res, ctx) => {
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json(operators.data ?? []),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/lang/:lang/articles`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(articles.data));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/configuration`,
//     async (req, res, ctx) => {
//       return res(ctx.status(200), ctx.delay(2000), ctx.json(configuration));
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/:lang/articles/search*`,
//     async (req, res, ctx) => {
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({ articleSearchResponse }),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/:lang/articles/:articleId/with-content`,
//     async (req, res, ctx) => {
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({ articleWithContent }),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/search*`,
//     async (req, res, ctx) => {
//       console.log(customerConversationItems);
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({ data: conversationsOrgSearch }),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId*`,
//     async (req, res, ctx) => {
//       console.log('get one conversation');
//       console.log(customerConversationItems.data[0]);
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({ ...customerConversationItems.data[0] }),
//       );
//     },
//   ),
//   rest.get(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations*`,
//     async (req, res, ctx) => {
//       console.log(customerConversationItems);
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({ ...customerConversationItems }),
//       );
//     },
//   ),

//   rest.post(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId`,
//     async (req, res, ctx) => {
//       const { orgId, conversationId } = req.params;
//       const createConversation = (await req.json()) as CreateConversation;
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({
//           ...customerConversations.data[0],
//           ...createConversation,
//           orgId,
//           conversationId,
//         }),
//       );
//     },
//   ),
//   rest.post(
//     `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/:orgId/conversations/:conversationId/messages/:messageId`,
//     async (req, res, ctx) => {
//       console.log('createMessage');
//       const { orgId, conversationId, messageId } = req.params;
//       return res(
//         ctx.status(200),
//         ctx.delay(2000),
//         ctx.json({
//           ...((await req?.json()) as CreateMessage),
//           conversationId,
//           orgId,
//           messageId,
//         } as EntityItem<typeof Message>),
//       );
//     },
//   ),
// ];
