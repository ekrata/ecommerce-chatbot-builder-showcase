export type TupleToObject<Type extends readonly any[]> = {
  [Key in Type[number]]: Key;
};
