import { CreateMessage } from '../../../../../../../stacks/entities/entities';

export const createMessage = async (
  orgId: string,
  conversationId: string,
  messageId: string,
  body: CreateMessage,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
