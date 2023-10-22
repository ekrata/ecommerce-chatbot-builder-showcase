import { isEmpty, isEqual, xorWith } from 'lodash';

export const isEquivalentArray = (x: object[], y: object[]) =>
  isEmpty(xorWith(x, y, isEqual));
