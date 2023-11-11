import { EntityItem } from 'electrodb';

import { Message } from '@/entities/message';
import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

import { AskAQuestionMessageForm } from './AskAQuestionMessageForm';
import { DecisionQuickRepliesMessageForm } from './DecisionQuickRepliesMessageForm';

export const getMessageForm = (message: EntityItem<typeof Message>) => {
  switch (message?.messageFormType) {
    case Action.AskAQuestion:
      return <AskAQuestionMessageForm message={message} />
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesMessageForm message={message} />
    default:
      return <></>
  }
}