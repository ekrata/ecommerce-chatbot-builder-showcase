import { EntityItem } from 'electrodb';
import { Dispatch, SetStateAction } from 'react';

import { Message } from '@/entities/message';
import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

import { AskAQuestionMessageForm } from './AskAQuestionMessageForm';
import { DecisionQuickRepliesMessageForm } from './DecisionQuickRepliesMessageForm';

export const getMessageForm = (message: EntityItem<typeof Message>, formSubmittedState?: [boolean, Dispatch<SetStateAction<boolean>>]) => {
  switch (message?.messageFormType) {
    case Action.AskAQuestion:
      return <AskAQuestionMessageForm message={message} formSubmittedState={formSubmittedState} />
    case Action.DecisionQuickReplies:
      return <DecisionQuickRepliesMessageForm message={message} formSubmittedState={formSubmittedState} />
    default:
      return <></>
  }
}