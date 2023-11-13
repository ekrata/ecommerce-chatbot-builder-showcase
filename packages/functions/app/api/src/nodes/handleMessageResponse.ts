import { EntityItem } from 'electrodb';
import { isEmpty } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { botNodeEvent } from '@/entities/bot';
import { ContactPropertiesEnum } from '@/entities/customer';
import { Message, NodeFormData } from '@/entities/message';
import { AskAQuestionData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/AskAQuestion';
import { DecisionButtonsData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionButtons';
import { DecisionCardMessagesData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionCardMessages';
import { DecisionQuickRepliesData } from '@/src/app/[locale]/dash/(root)/bots/[botId]/nodes/actions/DecisionQuickReplies';

import { getAppDb } from '../db';
import { BotStateContext } from './botStateContext';
import { formatMessage } from './formatMessage';

export const handleMessageResponse = async (
  message: EntityItem<typeof Message>,
  botStateContext: BotStateContext,
  appDb: ReturnType<typeof getAppDb>,
) => {
  const { currentNode, conversation } = botStateContext;
  // const { data, type } = botStateContext?.currentNode;
  const parsedData = JSON.parse(currentNode?.data ?? '{}') as NodeFormData;
  const askAQuestionData = parsedData as AskAQuestionData;
  const transferToOperatorMessageData = parsedData as
    | DecisionQuickRepliesData
    | DecisionButtonsData
    | DecisionCardMessagesData;
  if (askAQuestionData?.saveTheAnswerAsAContactProperty) {
    let fieldToUpdate: object = {};
    const { customerId, orgId } = conversation?.customer;
    switch (askAQuestionData?.validationType) {
      case 'Email':
        fieldToUpdate = { email: message?.content };
      case 'Name':
        fieldToUpdate = { name: message?.content };
      case 'Order Number':
        await appDb?.entities?.conversations
          .update({
            conversationId: conversation?.conversationId,
            orgId: orgId,
          })
          .append({ orderNumbers: [message?.content ?? ''] })
          .go();
      case 'None':
        fieldToUpdate = {};
      case 'Phone Number':
        fieldToUpdate = { phone: message?.content };
      case 'Address':
        fieldToUpdate = { address: message?.content };
      case 'URL':
        fieldToUpdate = { projectDomain: message?.content };
    }
    if (!isEmpty(fieldToUpdate)) {
      await appDb?.entities?.customers
        .update({
          customerId: customerId ?? conversation?.customerId,
          orgId: orgId,
        })
        .set(fieldToUpdate)
        .go();
    }
  }
  if (transferToOperatorMessageData?.transferToOperatorMessage) {
    const { customerId, conversationId, orgId, operatorId } = conversation;
    const initiateDate = Date.now() - 10000;
    await Promise.all([
      await appDb?.entities?.messages
        .upsert({
          messageId: uuidv4(),
          conversationId,
          orgId,
          operatorId: operatorId ?? '',
          customerId: customerId ?? '',
          sender: 'bot',
          content: await formatMessage(
            'Transfering you to an operator...',
            botStateContext,
            appDb,
          ),
          createdAt: initiateDate,
          sentAt: initiateDate,
        })
        .go(),
      await appDb?.entities?.messages
        .upsert({
          messageId: uuidv4(),
          conversationId,
          orgId,
          operatorId: operatorId ?? '',
          customerId: customerId ?? '',
          sender: 'bot',
          content: await formatMessage(
            `The average wait time is {${ContactPropertiesEnum.averageUnassignedWaitTime}}. We will be with you as soon as possible.`,
            botStateContext,
            appDb,
          ),
          createdAt: initiateDate + 10000,
          sentAt: initiateDate + 10000,
          botStateContext: JSON.stringify({
            ...botStateContext,
          } as BotStateContext),
        })
        .go(),
      await appDb.entities?.conversations
        ?.update({ orgId, conversationId })
        ?.set({ botId: '', operatorId: '' })
        ?.go(),
    ]);
  }
  return;
};
