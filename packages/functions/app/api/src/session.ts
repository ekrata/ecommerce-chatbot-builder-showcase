import { EntityItem } from 'electrodb';
import { Api, ApiHandler } from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { getAppDb } from './db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export const handler = ApiHandler(async () => {
  const session = useSession();

  // Check user is authenticated
  if (session.type !== 'operator') {
    return {
      statusCode: 403,
      body: JSON.stringify('Not authenticated'),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(session.properties),
    headers: {
      'Access-Control-Allow-Origin': Config.ALLOWED_ORIGINS,
      'Access-Control-Allow-Credentials': true,
    },
  };
});

// export const handler = AuthHandler({
//   providers: {
//     google: GoogleAdapter({
//       mode: 'oauth',
//       clientID: Config.OAUTH_GOOGLE_CLIENT_ID,
//       clientSecret: Config.OAUTH_GOOGLE_SECRET,
//       scope: '',
//       prompt: 'consent',
//       onSuccess: async (tokenset) => {
//         console.log('called google onSuccess');
//         const claims = tokenset.claims();

//         // Redirects to https://example.com?token=xxx
//         return Session.parameter({
//           redirect: `${Config.FRONTEND_URL}/dash`,
//           type: 'operator',
//           properties: operator.data as unknown as EntityItem<typeof Operator>,
//         });
//       },
//     }),
//   },
// });
