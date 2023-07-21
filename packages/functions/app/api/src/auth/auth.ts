// import { EntityItem } from 'electrodb';
// import { AuthHandler, GoogleAdapter, Session } from 'sst/node/auth';
// import { Config } from 'sst/node/config';
// import { Table } from 'sst/node/table';

// import { Operator } from '@/entities/operator';

// import { getAppDb } from '../db';

// declare module 'sst/node/auth' {
//   export interface SessionTypes {
//     operator: EntityItem<typeof Operator>;
//   }
// }

// const appDb = getAppDb(Config.REGION, Table.app.tableName);
// export const handler = AuthHandler({
//   providers: {
//     google: GoogleAdapter({
//       mode: 'oidc',
//       clientID: 'XXXX',
//       onSuccess: async (tokenset) => {
//         const claims = tokenset.claims();
//         const operator = appDb.entities.operators.get({});
//         const jwt = Session.create({
//           type: 'operator',
//           properties: operator,
//         });
//         /** TODO: create or look up a user from your db **/
//         // Redirects to https://example.com?token=xxx
//         return Session.parameter({
//           redirect: `${process.env['FRONTEND_URL']}/dash`,
//           type: 'operator',
//           properties: operator,
//         });
//       },
//     }),
//   },
// });
