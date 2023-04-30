export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'operator' | 'customer';
  sentAt: Date;
  editedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  content: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

export interface Customer extends Operator {
  ip: string;
  locale: string;
}
export type ChatStatus = 'unassigned' | 'open' | 'solved';

export interface Chat {
  id: string;
  orgId: string;
  connectionId: string;
  status: ChatStatus;
  operators: Operator[];
  customer: Customer;
  updatedAt: Date;
  createdAt: Date;
  tags: string[];

  messages: Message[];
}
