import { Api, Auth, NextjsSite, StackContext, Table, WebSocketApi } from "sst/constructs";
import { Service } from "electrodb"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const tableName = "app";

export function DefaultStack({ stack }: StackContext) {
  // const table = new Table(stack, tableName, {
  //   fields: {
  //     pk: "string",
  //     sk: "string",
  //     gsi1pk: "string",
  //     gsi1sk: "string",
  //   },
  //   globalIndexes: {
  //     "gsilpk-gsilsk-index": { partitionKey: "gsi1pk", sortKey: "gsi1sk", projection: "all", },
  //   },
  // })

  // const EmployeeApp = new Service({
  //   users: user,
  //   tasks: Task,
  //   offices: Office,
  // }, { client, table });

  // // Create the WebSocket API
  // const wsApi = new WebSocketApi(stack, "ws", {
  //   defaults: {
  //     function: {
  //       bind: [table],
  //     },
  //   },
  //   routes: {
  //     $connect: "pages/api/ws/connect.main",
  //     $disconnect: "pages/api/ws/disconnect.main",
  //     sendmessage: "pages/api/ws/sendMessage.main",
  //   },
  // });

  // // Create the WebSocket API
  // const api = new Api(stack, "app", {
  //   defaults: {
  //     function: {
  //       bind: [table],
  //     },
  //   },
  //   routes: {

  //   },
  // });

  const site = new NextjsSite(stack, "site", {
    customDomain: {
      domainName: "crow.ekrata.com",
      domainAlias: "www.crow.ekrata.com",
    }
  });

  // const auth = new Auth(stack, "auth", {
  //   authenticator: {
  //     handler: "packages/functions/src/auth.handler",
  //   },
  // });

  // auth.attach(stack, {
  //   api,
  //   prefix: "/auth", // optional
  // });
  // Show the API endpoint in the output
  stack.addOutputs({
    SiteUrl: site.url,
    // ApiEndpoint: api.url,
  });
}