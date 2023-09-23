import { ApiHandler } from 'sst/node/api';
import { useSession } from 'sst/node/auth';
import { Config } from 'sst/node/config';

export const handler = ApiHandler(async () => {
  return {
    body: '',
    statusCode: 204,
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
