('use server');

import { ConversationType } from '@/entities/conversation';
import {
  CreateConversation,
  CreateCustomer,
  CreateMessage,
} from '@/entities/entities';
import { SenderType } from '@/entities/message';
import { Api } from 'sst/node/api';
import { v4 as uuidv4 } from 'uuid';

export const createVisitor = async (orgId: string) => {
  const res = await fetch(
    `${Api.appApi.url}/orgs/${orgId}/visitors/${uuidv4()}`,
    {}
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
  mailingSubscribed: boolean
) => {
  const customerId = uuidv4();
  const customer: CreateCustomer = {
    orgId,
    customerId,
    mailingSubscribed,
    email,
  };
  const res = await fetch(
    `${Api.appApi.url}/orgs/${orgId}/customers/${customerId}`,
    { method: 'POST', body: JSON.stringify(customer) }
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
  type: ConversationType
) => {
  const conversationId = uuidv4();
  const conversation: CreateConversation = {
    orgId,
    conversationId,
    customerId,
    type,
    status: 'unassigned',
    channel: 'website',
  };
  const res = await fetch(
    `${Api.appApi.url}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'POST', body: JSON.stringify(conversation) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to create a conversation');
  }
  return res.json();
};

export const createMessage = async (
  orgId: string,
  conversationId: string,
  senderId: string,
  operatorId: string,
  customerId: string,
  sender: SenderType,
  content: string
) => {
  const messageId = uuidv4();
  const message: CreateMessage = {
    conversationId,
    messageId,
    customerId,
    operatorId,
    orgId,
    sender,
    content,
  };

  const res = await fetch(
    `${Api.appApi.url}/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`,
    { method: 'POST', body: JSON.stringify(message) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to create a message');
  }
  return res.json();
};
