"use server";

import {
  simulateNextReply,
  getConversation,
} from "@/server/services/conversation";
import { revalidatePath } from "next/cache";

export async function getConversationAction(threadId: string) {
  return await getConversation(threadId);
}

export async function generateAIReplyAction(threadId: string) {
  await simulateNextReply(threadId);
  revalidatePath(`/conversations/${threadId}`, "page");
}

