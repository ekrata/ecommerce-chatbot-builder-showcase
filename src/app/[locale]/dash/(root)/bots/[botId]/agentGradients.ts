import { BotNodeEvent, botNodeEvent } from '@/entities/bot';
import { Gradient } from '@/entities/customer';

// each agent has it's own unique gradient
export const agentGradients: Partial<Record<BotNodeEvent, Gradient>> = {
  [botNodeEvent.SalesBotAgent]:
    'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700',
};
