import { EntityItem } from 'electrodb';

import { Operator } from '@/entities/operator';

/**
 * Gets the current operator's session
 * @date 03/07/2023 - 11:12:51
 *
 * @returns {*}
 */
export const useOperatorSession = (): EntityItem<typeof Operator> => JSON.parse(localStorage.getItem('sessionUser')?.toString() ?? '') as EntityItem<typeof Operator>

export const setOperatorSession = (operator: EntityItem<typeof Operator>) => localStorage.setItem('sessionUser', JSON.stringify(operator))