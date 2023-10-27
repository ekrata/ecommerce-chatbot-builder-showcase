import { Config, StackContext } from 'sst/constructs';

export const getAllowedOrigins = (stage: string, domain: string) => {
  if (stage === 'local') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      `https://${stage}.${domain}`,
    ];
  } else if (stage === 'prod') {
    return [`https://${domain}`];
  } else {
    return [`https://${stage}.${domain}`];
  }
};
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
    return getAllowedOrigins(stack.stage, domain)?.[0];
  };

  const frontendUrl = new Config.Parameter(stack, 'FRONTEND_URL', {
    value: getFrontendUrl(),
  });

  const tableName = new Config.Parameter(stack, 'tableName', {
    value: `${stack.stage}-${appName}-app`,
  });

  const allowedOrigins = new Config.Parameter(stack, 'ALLOWED_ORIGINS', {
    value: getAllowedOrigins(stack.stage, domain)[0],
  });

  console.log('Frontend value: ', frontendUrl.value?.[0]);

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
    tableName,
    frontendUrl,
    allowedOrigins,
    oauthGoogleClientId,
    oauthGoogleSecret,
    stripeKeySecret,
    metaAppSecret,
    metaVerifySecret,
  };
}
