import { axiosClient } from "@/lib/axiosClient";
import type { GlobalChatMessage } from "../types/chat.types";

export interface GetMessagesParams {
  limit?: number;
  before?: string;
}

export const getGlobalMessages = async (
  params?: GetMessagesParams,
): Promise<GlobalChatMessage[]> => {
  const res = await axiosClient.get("/chat/messages", { params });
  return res.data?.data || [];
};

export interface SendMessagePayload {
  content: string;
  replyTo?: string | null;
}

export const sendGlobalMessage = async (
  payload: string | SendMessagePayload,
): Promise<GlobalChatMessage> => {
  const body =
    typeof payload === "string"
      ? { content: payload }
      : { content: payload.content, replyTo: payload.replyTo };
  const res = await axiosClient.post("/chat/messages", body);
  return res.data?.data;
};
