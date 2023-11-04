import { EntityItem } from 'electrodb';

import { Bot, BotNodeType } from '@/entities/bot';

import { Triggers } from '../bots/triggers/definitions.type';

export const getBotTriggers = (bots: EntityItem<typeof Bot>[]) => {
  const triggers = bots?.reduce<Record<string, BotNodeType[] | undefined>>(
    (prev, next) => ({
      ...prev,
      [`${next?.botId}`]: next?.nodes?.filter((node) => {
        const { type } = node;
        if (type && Object.values(Triggers).includes(type as any)) {
          return node;
        }
      }),
    }),
    {} as Record<string, BotNodeType[] | undefined>,
  );
  return triggers;
};
