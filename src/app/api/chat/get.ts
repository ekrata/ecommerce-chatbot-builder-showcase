import { cache } from 'react';
import 'server-only';

export const getChats = cache(async (orgId: string, userId: string) => {
  console.error(orgId, userId)
});

export const preload = (orgId: string, userId: string) => {
  getChats(orgId, userId);
}

