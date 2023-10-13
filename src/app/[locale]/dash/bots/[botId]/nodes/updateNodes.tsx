import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Action } from 'packages/functions/app/api/src/bots/triggers/definitions.type';
import { SetStateAction, useEffect, useMemo } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { BsPlus } from 'react-icons/bs';
import { MdOutlineDarkMode } from 'react-icons/md';
import { toast } from 'react-toastify';
import { Handle, Node, Position } from 'reactflow';
import { json } from 'stream/consumers';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateBotMut } from '@/app/[locale]/(hooks)/mutations/useUpdateBotMut';
import { useBotQuery } from '@/app/[locale]/(hooks)/queries/useBotQuery';

export const updateNodes = (values: object, currentNode: Node<unknown, string | undefined>, nodes: Node<unknown, string | undefined>[], setNodes: (value: SetStateAction<Node<unknown, string | undefined>[]>) => void) => {
  if (currentNode) {
    const { id, position } = currentNode
    if (id && position?.x && position?.y) {
      setNodes([...(nodes.filter((oldNode) => oldNode?.id !== id) ?? []), {
        ...currentNode, position: { x: position?.x, y: position.y }, data: JSON.stringify(values ?? '')
      }])
    }
  }
}