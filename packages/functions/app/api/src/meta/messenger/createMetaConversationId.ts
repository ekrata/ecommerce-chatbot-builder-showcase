import seedrandom from 'seedrandom';

export const createMetaConversationId = (senderId: string, pageId: string) => {
  var rng = seedrandom(`${senderId}.${pageId}`);
  return rng.double().toString().split('.')[1];
};
