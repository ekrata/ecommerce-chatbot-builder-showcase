import { getAppDb } from '../db';
import { fillTemplateStringFields } from '../messages/fillTemplateStringFields';
import { BotStateContext } from './botStateContext';

export const formatMessage = async (
  text: string,
  botStateContext: BotStateContext,
  appDb: ReturnType<typeof getAppDb>,
) => {
  let formattedText = text;
  const { conversation } = botStateContext;
  const { orgId, customerId, customer } = conversation;
  formattedText = await fillTemplateStringFields(
    formattedText,
    orgId,
    customerId ?? customer?.customerId ?? '',
    appDb,
  );
  return formattedText;
};
