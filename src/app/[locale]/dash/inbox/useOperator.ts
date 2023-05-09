'use server'

export const useChats = async (orgId: string) => {
  const res = await fetch(`${process.env.API_URL}/api/chats/getChats`);
  return res.json();
}


export const useOperator = async () => {
  const res = await fetch(`${process.env.API_URL}/api/chats/getChat`);
  return res.json();
}