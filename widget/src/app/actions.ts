import { v4 as uuidv4 } from 'uuid';

import { ConversationType } from '@/entities/conversation';
import { CreateConversation, CreateCustomer } from '@/entities/entities';

export const createVisitor = async (orgId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/visitors/${uuidv4()}`,
    {},
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to create a visitor');
  }
  return res.json();
};

export const createCustomer = async (
  orgId: string,
  email: string,
  mailingSubscribed: boolean,
) => {
  const customerId = uuidv4();
  const customer: CreateCustomer = {
    orgId,
    customerId,
    mailingSubscribed,
    email,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/customers/${customerId}`,
    { method: 'POST', body: JSON.stringify(customer) },
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to create a customer');
  }
  return res.json();
};

export const createConversation = async (
  orgId: string,
  customerId: string,
  type: ConversationType,
) => {
  const conversationId = uuidv4();
  const conversation: CreateConversation = {
    orgId,
    conversationId,
    customerId,
    status: 'unassigned',
    channel: 'website',
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'POST', body: JSON.stringify(conversation) },
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to create a conversation');
  }
  return res.json();
};
