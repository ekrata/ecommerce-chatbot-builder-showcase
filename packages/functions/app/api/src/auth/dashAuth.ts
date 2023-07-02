import { AuthHandler, GoogleAdapter, Session } from 'sst/node/auth';
import { Config } from 'sst/node/config';

export const handler = AuthHandler({
  // TODO: Define provider
  // ...
  providers: {
    google: GoogleAdapter({
      mode: "oauth",
      clientID: "<client-id>"
      clientSecret: Config.STRIPE_KEY,
      scope: "<space separated list of scopes>",
      prompt: "consent", // optional
      onSuccess: async (tokenset) => {},
    })
  },
  onSuccess: async () => {
    // TODO: Grab claims
    // ...
    return Session.cookie({
      redirect: Config.DASH_AUTH_REDIRECT ?? '',
      type: 'operator',
      properties: {
        userID: user.userID,
      },
    });
  },
});
