import { SSTConfig } from "sst";
import { NextjsSite, Table, WebSocketApi } from "sst/constructs";
import { DefaultStack } from "./stacks/DefaultStack";

export default {
  config(_input) {
    return {
      name: "crow",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(DefaultStack)
  },
} satisfies SSTConfig;
