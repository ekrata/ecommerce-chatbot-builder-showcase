export enum WsAppDetailType {
  wsAppCreateMessage = 'wsAppCreateMessage',
  wsAppUpdateMessage = 'wsAppUpdateMessage',

  wsAppCreateConversation = 'wsAppCreateConversation',
  wsAppUpdateConversation = 'wsAppUpdateConversation',

  wsAppCreateOperator = 'wsAppCreateOperator',
  wsAppUpdateOperator = 'wsAppUpdateOperator',

  wsAppCreateCustomer = 'wsAppCreateCustomer',
  wsAppUpdateCustomer = 'wsAppUpdateCustomer',

  wsAppCreateVisit = 'wsAppCreateVisit',
}

export enum ApiAppDetailType {
  apiAppCreateInteraction = 'apiAppCreateInteraction',
}

type AppEvent = typeof ApiAppDetailType & typeof WsAppDetailType;

export enum WhatsAppEvent {}

export enum InstagramEvent {}
