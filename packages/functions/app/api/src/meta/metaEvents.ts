export enum MessengerEvent {
  MessengerMessageDeliveries = 'message_deliveries',
  MessengerMessageEchoes = 'message_echoes',
  MessengerMessageReactions = 'message_reactions',
  MessengerMessageReads = 'message_reads',
  MessengerMessages = 'messages',
  MessengerMessagingAccountLinking = 'messaging_account_linking',
  MessengerMessagingFeedback = 'messaging_feedback',
  MessengerMessagingGamePlays = 'messaging_game_plays',
  MessengerMessagingHandovers = 'messaging_handovers',
  MessengerMessagingOptins = 'messaging_optins',
  MessengerMessagingPolicyEnforcement = 'messaging_policy_enforcement',
  MessengerMessagingPostbacks = 'messaging_postbacks',
  MessengerMessagingReferrals = 'messaging_referrals',
  MessengerMessagingSeen = 'messaging_seen',
  MessengerStandby = 'standby',
}

export enum InstagramEvent {
  InstagramMessageReactions = 'message_reactions',
  InstagramMessages = 'messages',
  InstagramMessagingPostbacks = 'messaging_postbacks',
  InstagramMessagingSeen = 'messaging_seen',
  InstagramMessagingReferral = 'messaging_referral',
  InstagramStandby = 'standby',
}

export enum WhatsappEvent {
  WhatsappMessages = 'messages',
}

export const MetaEvent = {
  ...MessengerEvent,
  ...InstagramEvent,
  ...WhatsappEvent,
};
