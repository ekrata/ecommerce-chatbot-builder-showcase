export enum VisitorBotInteractionTrigger {
  VisitorClicksBotsButton = 'Visitor clicks the bots button',
  VisitorClicksChatIcon = 'Visitor clicks on the chat icon',
  VisitorSays = 'Visitor says',
  InstagramStoryReply = 'Instagram - Story Reply',
  VisitorSelectsDepartment = 'Visitor selects department',
}

export enum VisitorPageInteractionTrigger {
  ByActionMadeOnYourPage = 'By action they made on your page',
  FirstVisitOnSite = 'First visit on site',
  VisitorReturnsToTheSite = 'Visitor returns to the site',
  MouseLeavesWindow = 'Mouse leaves window',
  VisitorScrollsPage = 'Visitor scrolls page',
  NewEvent = 'New event',
  FormAbandoned = 'Form abandoned',
  VisitorHasntContactedForSomeTime = "The visitor hasn't contacted you for some time",
  VisitorOpensSpecificPage = 'Visitor opens a specific page',
}

export enum Chatbots {
  SalesBot = 'Sales Bot',
  QuestionAndAnswerBot = 'Question and Answer Bot',
}

export enum OperatorInteractionTrigger {
  OperatorDoesNotRespondDuringTheConversation = "Operator doesn't respond during the conversation",
  OperatorStarted = 'Operator starts the chatbot',
  OperatorDoesNotTakeTheConversation = "Operator doesn't take the conversation",
  AllOperatorsLeftConversation = 'Operator marks conversation as solved',
  FromAnotherChatBot = 'From another chatbot',
  WhenYouStartIt = 'When you start it',
}

export const Triggers = {
  ...VisitorBotInteractionTrigger,
  ...VisitorPageInteractionTrigger,
  ...OperatorInteractionTrigger,
};

// export const invertedTriggers = invert(Triggers);

export enum Condition {
  BasedOnContactProperty = 'Based on Contact Property',
  Browser = 'Browser',
  OperatingSystem = 'Operating system',
  Mobile = 'Mobile',
  ReturningVisitor = 'Returning visitor',
  Day = 'Day',
  CurrentURL = 'Current URL',
  Language = 'Language',
  MailingSubscriber = 'Mailing Subscriber',
  ChatStatus = 'Chat status',
}

export enum ShopifyCondition {
  CartValue = 'Cart Value',
}

export enum Action {
  SendAChatMessage = 'Send a chat message',
  AskAQuestion = 'Ask a question',
  DecisionQuickReplies = 'Decision (Quick Replies)',
  DecisionButtons = 'Decision (Buttons)',
  OpenWebsiteInModal = 'Open website in modal',
  DecisionCardMessages = 'Decision (Card Messages)',
  SendAnEmail = 'Send an email',
  TransferToOperator = 'Transfer to operator',
  Delay = 'Delay',
  Randomize = 'Randomize',
  SetContactProperty = 'Set contact property',
  RemoveATag = 'Remove a tag',
  ChatWithBotEnded = 'Chat with bot ended',
  SubscribeForMailing = 'Subscribe for mailing',
  DisableTextInput = 'Disable text input',
  EnableTextInput = 'Enable text input',
  NotifyOperators = 'Notify operators',
  ToAnotherChatbot = 'To another chatbot',
  ReassignToADepartment = 'Reassign to a department',
  CouponCode = 'Coupon code',
  SendAnEventToGoogleAnalytics = 'Send an event to google analytics',
  SendAForm = 'Send a form',
}

export enum Agent {
  SalesBotAgent = 'Sales Agent',
  CustomerServiceAgent = 'Customer Service Agent',
}

export enum ShopifyAction {
  CheckOrderStatus = 'Shopify Check Order Status',
  ProductAvailability = 'Shopify Product Availability',
  ShippingZones = 'Shopify Shipping Zones',
  ShopifyCouponCode = 'Shopify Coupon code',
}

export const nodeType = {
  ...Triggers,
  ...Condition,
  ...ShopifyAction,
  ...Action,
  ...ShopifyCondition,
};

export type NodeTypeKey = keyof typeof nodeType;

export const triggerInterval = [
  'send once per 24 hours',
  'send only once per unique visitor',
  'send on every visit',
] as const;
export type TriggerInterval = (typeof triggerInterval)[number];
