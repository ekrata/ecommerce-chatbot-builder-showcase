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
  const orgId = conversation?.orgId ?? '';
  const customerId = conversation?.customerId ?? '';
  formattedText = await fillTemplateStringFields(
    formattedText,
    orgId,
    customerId,
    appDb,
  );
  return formattedText;
};
