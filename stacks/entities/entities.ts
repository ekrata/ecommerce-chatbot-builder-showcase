import { CreateEntityItem, UpdateEntityItem } from 'electrodb';
import { Org } from './org';
import { Conversation } from './conversation';
import { Message } from './message';
import { Operator } from './operator';
import { Customer } from './customer';

export type CreateOrg = CreateEntityItem<typeof Org>;
export type UpdateOrg = UpdateEntityItem<typeof Org>;

export type CreateConversation = CreateEntityItem<typeof Conversation>;
export type UpdateConversation = UpdateEntityItem<typeof Conversation>;

export type CreateMessage = CreateEntityItem<typeof Message>;
export type UpdateMessage = UpdateEntityItem<typeof Message>;

export type CreateOperator = CreateEntityItem<typeof Operator>;
export type UpdateOperator = UpdateEntityItem<typeof Operator>;

export type CreateCustomer = CreateEntityItem<typeof Customer>;
export type UpdateCustomer = UpdateEntityItem<typeof Customer>;
