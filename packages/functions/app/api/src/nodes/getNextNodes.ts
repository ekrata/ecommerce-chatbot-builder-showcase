import { BotEdgeType, BotNodeType } from '@/entities/bot';
import { OutputFieldsKeys } from '@/src/app/[locale]/dash/(root)/bots/outputFields';

import { BotStateContext } from './botStateContext';

export const getNextNodes = (
  ancestorNodeId: string,
  nodes?: BotNodeType[],
  edges?: BotEdgeType[],
  selectedEdgeLabel?: string,
): BotNodeType[] => {
  console.log('selectedEdgeLable', selectedEdgeLabel);
  const nodeIds = edges
    ?.filter((edge) => edge.target === ancestorNodeId)
    ?.filter((edge, i) => {
      if (selectedEdgeLabel) {
        const data = JSON.parse(edge?.data ?? '{}');
        return data?.label === selectedEdgeLabel;
      } else {
        return true;
      }
    })
    .map(({ source }) => source);

  return nodes?.filter(({ id }) => nodeIds?.includes(id)) ?? [];
};

export const findNextNodes = (botStateContext: BotStateContext) => {
  const { currentNode, bot, messages, conversation } = botStateContext;
  const { orgId } = conversation;
  const customerId =
    conversation?.customerId ?? conversation?.customer.customerId;
  if (currentNode?.id && bot?.nodes && bot?.edges) {
    const outputFieldKey =
      OutputFieldsKeys[botStateContext?.type as keyof typeof OutputFieldsKeys];
    let nextNodes: BotNodeType[] = [];
    if (!outputFieldKey || outputFieldKey === 'outputs') {
      // Will get every next node connected to this
      nextNodes = getNextNodes(currentNode.id, bot?.nodes, bot?.edges);
    } else if (outputFieldKey) {
      // Will get the node that matches the user selected choice/outcome in the latest message
      nextNodes = getNextNodes(
        currentNode.id,
        bot?.nodes,
        bot?.edges,
        messages?.slice(-1)[0]?.content,
      );
    }
    return nextNodes;
  }
  return [];
};
