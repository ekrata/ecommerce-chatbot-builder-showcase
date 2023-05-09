import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";
import { Operator } from '../../../../stacks/entities/operator';

declare module "sst/node/auth" {
  export interface SessionTypes {
    operator: {
      operatorId: string;
      orgId: string
    };
  }
}
export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: "XXXX",
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims()
        const operator = Operator.query.operator({ operatorId }) /** TODO: create or look up a user from your db **/
        // Redirects to https://example.com?token=xxx
        return Session.parameter({
          redirect: `${process.env['FRONTEND_URL']}/dash`,
          type: "operator",
          properties: {
            operatorId: operator.operatorId
          },
        })
      }),
  },
});