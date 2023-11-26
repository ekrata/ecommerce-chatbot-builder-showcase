export const repeat = (n: any, cb: any) => [...Array(n)].map(cb);

export const relativeDiff = (a: number, b: number) => {
  const diff = 100 * Math.abs((a - b) / ((a + b) / 2));
  return diff;
};
