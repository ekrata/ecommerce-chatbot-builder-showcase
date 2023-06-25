import { CreateEntityItem, UpdateEntityItem } from 'electrodb';
import { Org } from './org';
import { Conversation } from './conversation';
import { Message } from './message';
import { Operator } from './operator';
import { Customer } from './customer';
import { Visitor } from './visitor';
import { Configuration } from './configuration';
import { Translation } from './translation';
import { Article } from './article';
import { ArticleContent } from './articleContent';

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

export type CreateVisitor = CreateEntityItem<typeof Visitor>;
export type UpdateVisitor = UpdateEntityItem<typeof Visitor>;

export type CreateConfiguration = CreateEntityItem<typeof Configuration>;
export type UpdateConfiguration = UpdateEntityItem<typeof Configuration>;

export type CreateTranslation = CreateEntityItem<typeof Translation>;
export type UpdateTranslation = UpdateEntityItem<typeof Translation>;

export type CreateArticle = CreateEntityItem<typeof Article>;
export type UpdateArticle = UpdateEntityItem<typeof Article>;

export type CreateArticleContent = CreateEntityItem<typeof ArticleContent>;
export type UpdateArticleContent = UpdateEntityItem<typeof ArticleContent>;
