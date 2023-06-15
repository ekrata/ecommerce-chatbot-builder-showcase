'use-client'

import { EntityItem } from "electrodb";
import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { Conversation } from "@/entities/conversation";
import { useFormatter, useTranslations } from "next-intl";
import { ConversationItem } from "../../(actions)/types";
import { BiChevronRight } from "react-icons/bi";
import { Server } from "mock-socket";
import { createRandomConversation, createRandomCustomer, createRandomMessages, createRandomOperator, createRandomOrg, loadConfiguration, setupTranslation } from "@/app/[locale]/dash/inbox/mocks.test";
import { Meta, StoryObj } from "@storybook/react";
import { MessageCard } from "./MessageCard";
import { within } from "@storybook/testing-library";

const meta: Meta<typeof MessageCard> = {
  component: MessageCard,
};

export default meta;
type Story = StoryObj<typeof MessageCard>;
type Canvas = ReturnType<typeof within>;

const messageCount = 20;
const org = createRandomOrg();
const customer = createRandomCustomer(org.orgId);
const operator = createRandomOperator(org.orgId);
const conversation = createRandomConversation(
  'open',
  org.orgId,
  operator.operatorId,
  customer.customerId
);
const messages = createRandomMessages([org.orgId, conversation.conversationId, operator.operatorId, customer.customerId], 20)
const configuration = loadConfiguration(org.orgId);
const lang = 'en';
setupTranslation(org.orgId, lang);

export const Default: Story = {
  render: () => {
    const conversationItem: ConversationItem = 
      {conversation, operator, messages}

    return <MessageCard conversation={conversationItem}/> 
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step(
      'Customer sends a message asking for help finding an item.',
      async () => {
        // sessionStorage.removeItem('customerChatStore');
        // localStorage.removeItem('customerChatStore');
        // useCustomerChatStore.persist.clearStorage();

        // const messages = createRandomMessages(
        //   [
        //     org.orgId,
        //     conversation.conversationId,
        //     operator.operatorId,
        //     customer.customerId,
        //   ],
        //   messageCount
        // );
        // useCustomerChatStore.setState(
        //   {
        //     org,
        //     customer,
        //     operator,
        //     conversation,
        //     configuration,
        //   },
        //   true
        // );
        // (await canvas.findByTestId('start-chat-btn')).click();
        // expect(useCustomerChatStore().widgetState).toEqual('');
      }
    );
  },
};