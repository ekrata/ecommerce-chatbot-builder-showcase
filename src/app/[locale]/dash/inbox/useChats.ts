'use server'

import { Api } from "sst/node/api";
import { Chat } from "./Chat.type";

export const useChats = async (orgId: string) => {
  const res = await fetch(`${process.env.API_URL}/api/chats/getChats`);
  return res.json();
}


export const getChat = async (orgId: string, chatId: string): Promise<Chat[]> => {
  const res = await fetch(`${Api}/api/chats/getChat`);
  return res.json();
}