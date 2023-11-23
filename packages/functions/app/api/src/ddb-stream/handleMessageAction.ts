import { EntityItem } from 'electrodb';

import { Message } from '@/entities/message';

import { getAppDb } from '../db';
import { BotStateContext } from '../nodes/botStateContext';
import { handleMessageResponse } from '../nodes/handleMessageResponse';
import { publishToNextNodes } from '../nodes/publishToNextNodes';

export const handleMessageAction = async (
  messageData: EntityItem<typeof Message>,
  appDb: ReturnType<typeof getAppDb>,
) => {
  console.log('we here');
  if (
    (messageData?.botStateContext != null &&
      messageData.sender === 'customer') ||
    (messageData?.messageFormType !== '' && messageData?.sender === 'bot')
  ) {
    console.log('ininkjaksdjask');
    const botStateContext = JSON.parse(
      messageData?.botStateContext ?? '{}',
    ) as BotStateContext;

    // const data = JSON.parse(
    //   botStateContext ?? '{}',
    // ) as BotStateContext;

    // console.log(botStateContext);
    // console.log(botStateContext);
    console.log(
      botStateContext?.currentNode?.id,
      botStateContext?.bot?.nodes,
      botStateContext?.bot?.edges,
    );
    if (
      botStateContext?.currentNode?.id &&
      botStateContext?.bot?.nodes &&
      botStateContext?.bot?.edges
    ) {
      console.log('sadjasjdsa');
      // console.log(botStateContext);
      // current/next node incrementation for inputAction's updating message occurs here rather than in the lambda
      const newBotStateContext = {
        ...botStateContext,
        messages: [...(botStateContext?.messages ?? []), messageData],
      };
      console.log('inn botstate');
      await handleMessageResponse(messageData, botStateContext, appDb);
      await publishToNextNodes(newBotStateContext, appDb);
    }
  }
  return [];
};
