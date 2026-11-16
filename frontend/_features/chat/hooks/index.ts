import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGlobalMessages,
  sendGlobalMessage,
  type GetMessagesParams,
  type SendMessagePayload,
} from "../api";
import type { GlobalChatMessage } from "../types/chat.types";
import { getSocket } from "@/lib/socket";

export const GLOBAL_CHAT_QUERY_KEY = ["global-chat-messages"];

export const useGetGlobalMessages = (params?: GetMessagesParams) => {
  const queryClient = useQueryClient();

  // Initial fetch + fallback re-fetch every 30s instead of aggressive 3s polling
  const query = useQuery({
    queryKey: [...GLOBAL_CHAT_QUERY_KEY, params],
    queryFn: () => getGlobalMessages(params),
    staleTime: Infinity,
    refetchInterval: 30000,
  });

  // Real-time WebSocket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (incomingMsg: GlobalChatMessage) => {
      queryClient.setQueryData<GlobalChatMessage[]>(
        [...GLOBAL_CHAT_QUERY_KEY, params],
        (old = []) => {
          // Avoid duplicate messages if already present
          if (old.some((m) => m._id === incomingMsg._id)) {
            return old;
          }
          return [...old, incomingMsg];
        },
      );
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [queryClient, params]);

  return query;
};

export const useSendGlobalMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: string | SendMessagePayload) =>
      sendGlobalMessage(payload),
    onSuccess: (newMessage: GlobalChatMessage) => {
      queryClient.setQueryData<GlobalChatMessage[]>(
        [...GLOBAL_CHAT_QUERY_KEY, undefined],
        (old = []) => {
          if (old.some((m) => m._id === newMessage._id)) {
            return old;
          }
          return [...old, newMessage];
        },
      );
    },
  });
};
