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
  typing: boolean;
}

type StarRating = 1 | 2 | 3 | 4 | 5

export interface Opinion {
  date: Date
  productRange?: StarRating
  customerService?: StarRating
  orderingPostage?: StarRating
}

export interface Operator {
  id: string;
  name?: string;
  email: string;
  profilePicture: string;
  updatedAt: Date;
  createdAt: Date;
}

export const DefaultTags = ['New', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Loves to chat', 'Long Browser', 'Loves recommendations']

export interface Customer {
  customer: string;
  name?: string;
  email: string;
  profilePicture: string;
  mailingSubscribed: boolean;
  ip: string;
  locale: string;
  phone?: string;
  userAgent?: string;
  tags?: string[];
  properties?: { [key: string]: string };
  timezone?: string;
  visited: { [datetime: string]: string };
  opinions?: Opinion[]
  notes: string,
  updatedAt: Date;
  createdAt: Date;
}

export type ChatStatus = 'unassigned' | 'open' | 'solved';

export interface Chat {
  chat: string;
  orgId: string;
  connectionId: string;
  status: ChatStatus;
  operators: Operator[];
  customer: Customer;
  updatedAt: Date;
  createdAt: Date;
  taggedViews: string[];
  read: boolean,
  messages: Message[];
}
