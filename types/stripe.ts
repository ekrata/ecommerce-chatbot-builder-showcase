export const triggerAmount = [
  1000, 2000, 3000, 5000, 10000, 20000, 50000,
] as const;

export type TriggerAmount = (typeof triggerAmount)[number];
