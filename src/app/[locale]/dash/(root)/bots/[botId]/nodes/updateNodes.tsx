import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { SetStateAction, useEffect, useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';
import { Node, Position } from 'reactflow';

import { Action } from '@/packages/functions/app/api/src/bots/triggers/definitions.type';

export const updateNodes = (values: object, currentNode: Node<unknown, string | undefined>, nodes: Node<unknown, string | undefined>[], setNodes: (value: SetStateAction<Node<unknown, string | undefined>[]>) => void, errors?: FieldErrors<object>) => {
  if (currentNode) {
    const { id, position } = currentNode
    if (id && position?.x && position?.y) {
      const newNodes = [...(nodes.filter((oldNode) => oldNode?.id !== id) ?? []), {
        ...currentNode, position: { x: position?.x, y: position?.y }, data: { ...values, errors }
      }]
      console.log(newNodes)
      setNodes(newNodes)
    }
  }
}