import { BotEdgeType, BotNodeType } from '@/entities/bot';

export const getNextNodes = (
  ancestorNodeId: string,
  nodes?: BotNodeType[],
  edges?: BotEdgeType[],
  selectedEdgeLabel?: string,
): BotNodeType[] => {
  const nodeIds = edges
    ?.filter((edge) => edge.target === ancestorNodeId)
    ?.filter((edge) => {
      if (selectedEdgeLabel) {
        return JSON.parse(edge?.data ?? '{}')?.label === selectedEdgeLabel;
      } else {
        return true;
      }
    })
    .map(({ source }) => source);

  return nodes?.filter(({ id }) => nodeIds?.includes(id)) ?? [];
};
