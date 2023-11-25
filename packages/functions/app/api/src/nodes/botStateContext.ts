import { EntityItem } from 'electrodb';

import { Bot, BotNodeEvent, BotNodeType } from '@/entities/bot';
import { ConversationItem } from '@/entities/conversation';
import { Interaction } from '@/entities/interaction';
import { Message } from '@/entities/message';

export type BotStateContext = {
  type: BotNodeEvent;
  // interaction that started this bot
  interaction: EntityItem<typeof Interaction>;
  bot: EntityItem<typeof Bot>;
  conversation: ConversationItem;
  nextNode?: BotNodeType;
  currentNode?: BotNodeType;
};
