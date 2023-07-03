import { Operator } from "@/entities/operator"
import { getCookie } from "cookies-next"
import { EntityItem } from "electrodb"


/**
 * Gets the current operator's session
 * @date 03/07/2023 - 11:12:51
 *
 * @returns {*}
 */
export const useOperatorSession =  (): EntityItem<typeof Operator> => JSON.parse(getCookie('sessionUser')?.toString() ?? '') as EntityItem<typeof Operator>