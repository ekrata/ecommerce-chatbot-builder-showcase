// import { ApiHandler, useJsonBody, useQueryParam } from 'sst/node/api';
// import { Config } from 'sst/node/config';
// import { Table } from 'sst/node/table';

// import * as Sentry from '@sentry/serverless';

// import { getAppDb } from '../../db';
// import { verifyMetaRequestSignature } from './verifyMetaRequestSignature';

// const appDb = getAppDb(Config.REGION, Table.app.tableName);

// // Your app will need to ask for the following permissions via Facebook Login for Messenger conversations:

// // pages_show_list
// // pages_manage_metadata
// // pages_messaging
// // pages_read_engagement
// // To access Instagram Messaging, you must also ask for:

// // instagram_basic
// // instagram_manage_messages

// export const handler = Sentry.AWSLambda.wrapHandler(
//   ApiHandler(async (evt, ctx) => {
//     try {
//       const body = useJsonBody()
//       if(body?.['message']) {
//       return {
//         "sender":{
//           "id":"<PSIe>"
//         },
//         "recipient":{
//           "id":"<PAGE_ID>"
//         },
//         "timestamp": 1458692752478,
//         "message":{
//           "mid":"mid.1457764197618:41d102a3e1ae206a38",
//           "text":"hello, world!",
//           "quick_reply": {
//             "payload": "<DEVELOPER_DEFINED_PAYLOAD>"
//           }
//         }
//       }

//       }
//       if (body?.['entry']) {
//           const entries = await client
//             .putEvents({
//               Entries: [
//                 {
//                   EventBusName: EventBus.appEventBus.eventBusName,
//                   Source: 'fbMessenger',
//                   DetailType: '',
//                   Detail: JSON.stringify(record),
//                 },
//               ],
//             })
//             .promise();
//           }
//         }
//       if()
//       if ('message_reaction') {

//       }
//       if('messaging_postbacks') {

//       }
//       if('messaging_seen') {

//       }
//       if('messaging_referral') {

//       }
//       if('standby') {

//       }
//       verifyMetaRequestSignature();
//     } catch {
//       return { statusCode: 500, body: '' };
//     }
//   }),
// );
