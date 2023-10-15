import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { SetStateAction, useEffect, useMemo } from 'react';
import { Node, Position } from 'reactflow';

export const updateNodes = (values: object, currentNode: Node<unknown, string | undefined>, nodes: Node<unknown, string | undefined>[], setNodes: (value: SetStateAction<Node<unknown, string | undefined>[]>) => void) => {
  if (currentNode) {
    const { id, position } = currentNode
    console.log(values)
    if (id && position?.x && position?.y) {
      setNodes([...(nodes.filter((oldNode) => oldNode?.id !== id) ?? []), {
        ...currentNode, position: { x: position?.x, y: position.y }, data: values
      }])
    }
  }
}