import { Config, StackContext } from 'sst/constructs';

export function paramStack({ stack, app }: StackContext) {
  const IS_LOCAL = new Config.Parameter(stack, 'IS_LOCAL', {
    value: JSON.stringify(app.local),
  });
  const appName = 'echat';

  const domain = `${appName}.ekrata.com`;

  const REGION = new Config.Parameter(stack, 'REGION', {
    value: app.region,
  });

  const getFrontendUrl = () => {
    if (app.local) {
      return 'http://localhost:3000';
    }
    return stack.stage === 'prod' ? domain : `${stack.stage}.${domain}`;
  };

  const frontendUrl = new Config.Parameter(stack, 'FRONTEND_URL', {
    value: getFrontendUrl(),
  });

  const getAllowedOrigins = () => {
    if (app.local) {
      return 'http://localhost:3000';
    }
    return stack.stage === 'prod'
      ? `https://${domain}`
      : `https://${stack.stage}.${domain}`;
  };

  const allowedOrigins = new Config.Parameter(stack, 'ALLOWED_ORIGINS', {
    value: getAllowedOrigins(),
  });

  console.log('Frontend value: ', frontendUrl.value);

  const oauthGoogleClientId = new Config.Parameter(
    stack,
    'OAUTH_GOOGLE_CLIENT_ID',
    {
      value: `11916374620-iveeirp449he0iocir9j15v4be5c1rjt.apps.googleusercontent.com`,
    },
  );

  const oauthGoogleSecret = new Config.Secret(stack, 'OAUTH_GOOGLE_SECRET');
  const stripeKeySecret = new Config.Secret(stack, 'STRIPE_KEY_SECRET');
  const metaAppSecret = new Config.Secret(stack, 'META_APP_SECRET');
  const metaVerifySecret = new Config.Secret(stack, 'META_VERIFY_SECRET');

  return {
    appName,
    domain,
    REGION,
    frontendUrl,
    allowedOrigins,
    oauthGoogleClientId,
    oauthGoogleSecret,
    stripeKeySecret,
    metaAppSecret,
    metaVerifySecret,
  };
}
