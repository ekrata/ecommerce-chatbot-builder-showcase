import { ConversationItem } from '@/entities/conversation';
import { sortConversationItems } from '../../(helpers)/sortConversationItems';

export /**
 * Returns sorted conversations
 * @date 23/06/2023 - 15:01:19
 *
 * @async
 * @param {string} orgId
 * @param {string} customerId
 * @returns {Promise<ConversationItem[]>}
 */
const getConversationItems = async (
  orgId: string,
  customerId: string
): Promise<ConversationItem[]> => {
  const res = await (
    await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_API_URL
      }/orgs/${orgId}/conversations?customerId=${customerId}&includeMessages=true&expansionFields=${encodeURIComponent(
        JSON.stringify(['customerId', 'operatorId'])
      )}`
    )
  ).json();
  sortConversationItems(res.data as ConversationItem[]);
  return res.data;
};
