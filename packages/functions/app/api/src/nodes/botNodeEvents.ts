import { actions, conditions } from '@/entities/bot';

type BotNodeEvent = [...actions, ...conditions] as const;

BotNodeEvent.
