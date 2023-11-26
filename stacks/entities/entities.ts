import { CreateEntityItem, UpdateEntityItem } from 'electrodb';

import { Analytic } from './analytics';
import { Article } from './article';
import { ArticleContent } from './articleContent';
import { Bot } from './bot';
import { BotTemplate } from './botTemplate';
import { Configuration } from './configuration';
import { Conversation } from './conversation';
import { Customer } from './customer';
import { Interaction } from './interaction';
import { Message } from './message';
import { Operator } from './operator';
import { Org } from './org';
import { Translation } from './translation';
import { Visit } from './visit';

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

export type CreateVisit = CreateEntityItem<typeof Visit>;
export type UpdateVisit = UpdateEntityItem<typeof Visit>;

export type CreateConfiguration = CreateEntityItem<typeof Configuration>;
export type UpdateConfiguration = UpdateEntityItem<typeof Configuration>;

export type CreateTranslation = CreateEntityItem<typeof Translation>;
export type UpdateTranslation = UpdateEntityItem<typeof Translation>;

export type CreateAnalytic = CreateEntityItem<typeof Analytic>;
export type UpdateAnalytic = UpdateEntityItem<typeof Analytic>;

export type CreateArticle = CreateEntityItem<typeof Article>;
export type UpdateArticle = UpdateEntityItem<typeof Article>;

export type CreateArticleContent = CreateEntityItem<typeof ArticleContent>;
export type UpdateArticleContent = UpdateEntityItem<typeof ArticleContent>;

export type CreateBot = CreateEntityItem<typeof Bot>;
export type UpdateBot = UpdateEntityItem<typeof Bot>;

export type CreateBotTemplate = CreateEntityItem<typeof BotTemplate>;
export type UpdateBotTemplate = UpdateEntityItem<typeof BotTemplate>;

export type CreateInteraction = CreateEntityItem<typeof Interaction>;
export type UpdateInteraction = UpdateEntityItem<typeof Interaction>;
