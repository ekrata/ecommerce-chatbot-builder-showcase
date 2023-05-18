export const mockOrgCount = 3;
export const mockCustomerCount = 5;
export const mockOperatorCount = 2;
export const mockConversationCountPerCustomer = 1;
export const mockMessageCountPerConversation = 10;

export interface MockOrgIds {
  orgId: string;
  operatorIds: string[];
  customers: {
    customerId: string;
    conversations: { conversationId: string; messageIds: string[] }[];
  }[];
}


