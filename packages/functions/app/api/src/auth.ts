import { EntityItem } from 'electrodb';
import { AuthHandler, GoogleAdapter, Session } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import * as Sentry from '@sentry/serverless';

import { getAppDb } from './db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

declare module 'sst/node/auth' {
  // composite key for operator
  export interface SessionTypes {
    operator: {
      operatorId: string;
      orgId: string;
    };
  }
}

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: 'oidc',
      clientID: Config.OAUTH_GOOGLE_CLIENT_ID,
      onSuccess: async (tokenset) => {
        try {
          const claims = tokenset.claims();

          let operatorRes = await appDb.entities.operators.scan
            .where(({ email }, { eq }) => eq(email, claims.email))
            .go();

          // if multiple operators returned, get the most recently created
          operatorRes.data.sort((a, b) => {
            if (a?.createdAt && b?.createdAt) {
              return b?.createdAt - a?.createdAt;
            }
            return 0;
          });
          // await appDb.entities.operators.get({operatorId: operatorRes.data});
          // sign up
          if (!operatorRes?.data?.length) {
            const org = await appDb.entities.orgs
              .upsert({
                name: `${claims.name}'s Organisation`,
                email: '',
              })
              .go({ response: 'all_new' });
            const operatorUpsertRes = await appDb.entities.operators
              .upsert({
                orgId: org.data.orgId,
                operatorId: claims.sub,
                profilePicture: claims.picture,
                name: claims.given_name,
              })
              .go({ response: 'all_new' });

            return Session.parameter({
              redirect: Config.FRONTEND_URL,
              type: 'operator',
              properties: {
                orgId: operatorRes?.data?.[0]?.orgId,
                operatorId: operatorRes.data?.[0]?.operatorId,
              },
            });
          } else {
            // login
            const operatorUpdateRes = await appDb.entities.operators
              .update({
                operatorId: claims.sub,
                orgId: operatorRes?.data?.[0].orgId,
              })
              .set({ profilePicture: claims.picture, name: claims.given_name })
              .go();
            return Session.parameter({
              redirect: Config.FRONTEND_URL,
              type: 'operator',
              properties: {
                orgId: operatorRes?.data?.[0]?.orgId,
                operatorId: operatorRes.data?.[0]?.operatorId,
              },
            });
          }
        } catch (err) {
          Sentry.captureException(err);
          return {
            statusCode: 500,
            body: JSON.stringify(err),
          };
        }
      },
    }),
  },
});
