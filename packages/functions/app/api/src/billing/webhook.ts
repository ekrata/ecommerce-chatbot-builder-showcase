// const AWS = require('aws-sdk');

// const secretsClient = new AWS.SecretsManager();
// const secretName = process.env.SECRET_NAME;

// const eventBridge = new AWS.EventBridge();

// exports.handler = async (event) => {
//   const { headers, body } = event;

//   let statusCode = 200,
//     message = '';

//   try {
//     if (!headers || !body) throw new Error('request not wellformed');

//     if (!headers['Stripe-Signature']) throw new Error('signature missing');

//     let sig = headers['Stripe-Signature'];

//     if (Array.isArray(sig) && sig.length > 0) sig = sig[0];

//     let secrets;

//     // let secretValue = await secretsClient
//     //   .getSecretValue({ SecretId: secretName })
//     //   .promise();

//     if ('SecretString' in secretValue) {
//       secrets = secretValue.SecretString;
//     } else {
//       let buff = new Buffer(secretValue.SecretBinary, 'base64');
//       secrets = buff.toString('ascii');
//     }

//     secrets = JSON.parse(secrets);

//     const stripeKey = secrets['STRIPE_SECRET_KEY'];
//     const endpointSecret = secrets['ENDPOINT_SECRET'];

//     const stripe = require('stripe')(stripeKey);

//     const webhookEvent = stripe.webhooks.constructEvent(
//       body,
//       sig,
//       endpointSecret
//     );

//     const params = {
//       Entries: [
//         {
//           Source: 'stripe-webhook-lambda',
//           // Must match with the source defined in rules

//           Detail: JSON.stringify(webhookEvent),
//           Resources: ['resource1', 'resource2'],
//           DetailType: 'stripeWebhookDetailType',
//         },
//       ],
//     };
//     const eventBridgeEvent = await eventBridge.putEvents(params).promise();
//     message = 'event created successfully';
//   } catch (e) {
//     statusCode = 400;
//     message = e.message;
//   }
//   const response = {
//     statusCode: statusCode,
//     body: JSON.stringify(message),
//   };
//   return response;
// };
