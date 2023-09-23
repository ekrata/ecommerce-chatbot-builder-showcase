import { EntityItem } from 'electrodb';
import { GiSentryGun } from 'react-icons/gi';
import { AuthHandler, GoogleAdapter, Session } from 'sst/node/auth';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { Operator } from '@/entities/operator';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from './db';

const appDb = getAppDb(Config.REGION, Table.app.tableName);

declare module 'sst/node/auth' {
  export interface SessionTypes {
    operator: EntityItem<typeof Operator>;
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
          console.log(claims);

          let operatorRes = await appDb.entities.operators.scan
            .where(({ email }, { eq }) => `${eq(email, claims?.email)}`)
            .go();

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
              properties: operatorUpsertRes?.data,
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
              properties: operatorRes.data?.[0],
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
