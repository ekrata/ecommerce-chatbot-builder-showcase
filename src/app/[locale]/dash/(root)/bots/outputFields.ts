import {
  Action,
  Agent,
  Condition,
  VisitorBotInteractionTrigger,
  VisitorPageInteractionTrigger,
} from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

export const OutputFieldsKeys = {
  [`${Action.AskAQuestion}`]: 'outputs',
  [`${Action.CouponCode}`]: 'outputs',
  [`${Action.SendAChatMessage}`]: 'outputs',
  [`${Action.TransferToOperator}`]: 'outputs',
  [`${Action.DecisionQuickReplies}`]: 'quickReplies',
  [`${Action.DecisionCardMessages}`]: 'choices',
  [`${Action.DecisionButtons}`]: 'choices',
  [`${Action.SubscribeForMailing}`]: 'outputs',
  [`${Agent.SalesBotAgent}`]: 'outputs',
  [`${Agent.CustomerServiceAgent}`]: 'outputs',
  [`${Condition.BasedOnContactProperty}`]: 'outputs',
  [`${Condition.ChatStatus}`]: 'outputs',
  [`${VisitorBotInteractionTrigger.VisitorClicksBotsButton}`]: 'outputs',
  [`${VisitorBotInteractionTrigger.VisitorClicksChatIcon}`]: 'outputs',
  [`${VisitorBotInteractionTrigger.VisitorSays}`]: 'outputs',
  [`${VisitorPageInteractionTrigger.FirstVisitOnSite}`]: 'outputs',
} as const;

export type OutputFieldKey = keyof typeof OutputFieldsKeys;
export type OutputFieldValue = (typeof OutputFieldsKeys)[OutputFieldKey];
