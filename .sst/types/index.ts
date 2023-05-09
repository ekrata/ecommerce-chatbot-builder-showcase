import "sst/node/config";
declare module "sst/node/config" {
  export interface ConfigTypes {
    APP: string;
    STAGE: string;
  }
}import "sst/node/table";
declare module "sst/node/table" {
  export interface TableResources {
    "app": {
      tableName: string;
    }
  }
}import "sst/node/api";
declare module "sst/node/api" {
  export interface WebSocketApiResources {
    "ws": {
      url: string;
    }
  }
}import "sst/node/api";
declare module "sst/node/api" {
  export interface ApiResources {
    "api": {
      url: string;
    }
  }
}import "sst/node/auth";
declare module "sst/node/auth" {
  export interface AuthResources {
    "auth": {
      publicKey: string;
    }
  }
}import "sst/node/site";
declare module "sst/node/site" {
  export interface NextjsSiteResources {
    "site": {
      url: string;
    }
  }
}