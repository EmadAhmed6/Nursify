"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  User,
  Crown,
  Sparkles,
  Minimize2,
  Maximize2,
  Reply,
} from "lucide-react";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  useGetGlobalMessages,
  useSendGlobalMessage,
} from "@/_features/chat/hooks";
import type { GlobalChatMessage } from "@/_features/chat/types";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import Cookies from "js-cookie";

export default function FloatingChatWidget() {
  const [mounted, setMounted] = useState(false);
  const { isArabic } = useLanguage();
  const token = Cookies.get("token");
  const { data: currentUser } = useGetAuthMeQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<GlobalChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: messages = [], isLoading } = useGetGlobalMessages();
  const sendMutation = useSendGlobalMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || sendMutation.isPending) return;

    sendMutation.mutate(
      { content: trimmed, replyTo: replyingTo?._id },
      {
        onSuccess: () => {
          setMessageText("");
          setReplyingTo(null);
          setTimeout(scrollToBottom, 50);
        },
      },
    );
  };

  // Only show if user is authenticated and client is mounted
  if (!mounted || !token) return null;

  return (
    <>
      {/* Floating Action Button at Bottom-Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative p-3.5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center group ${
            isOpen
              ? "bg-rose-500 hover:bg-rose-600 text-white scale-95"
              : "bg-primary hover:bg-primaryHover text-primary-foreground hover:scale-105 active:scale-95"
          }`}
          aria-label={isArabic ? "المحادثة العامة" : "Global Public Chat"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              {/* Active Pulse Indicator */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 left-6 z-50 w-[92vw] sm:w-97.5 h-[520px] max-h-[80vh] bg-bgSecondary/95 backdrop-blur-xl border border-borderPrimary rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-borderPrimary/60 bg-bgPrimary/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Text as="h3" size="xs" font="bold" color="primary">
                    {isArabic ? "غرفة المحادثة العامة" : "Public Chat Room"}
                  </Text>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <Text as="p" size="xs" color="secondary" className="text-[10px]">
                  {isArabic ? "محادثة حية لجميع طلاب التمريض" : "Live chat for nursing students"}
                </Text>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgSecondary transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {isLoading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-textSecondary opacity-60">
                <MessageSquare className="h-10 w-10 mb-2 opacity-40" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "لا توجد رسائل بعد. كن أول من يكتب في الغرفة!"
                    : "No messages yet. Be the first to start the conversation!"}
                </Text>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?._id;
                const role = msg.sender?.role;

                return (
                  <div
                    key={msg._id}
                    className={`group/msg relative flex items-start gap-2.5 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Sender Avatar */}
                    {msg.sender?.profilePicture?.url ? (
                      <img
                        src={msg.sender.profilePicture.url}
                        alt={msg.sender.fullName || msg.sender.username}
                        className="h-7 w-7 rounded-full object-cover shrink-0 border border-borderPrimary/60"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Message Bubble Container */}
                    <div
                      className={`max-w-[78%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Meta */}
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-textSecondary">
                        <span className="font-bold text-textPrimary truncate max-w-[120px]">
                          {isMe
                            ? isArabic
                              ? "أنت"
                              : "You"
                            : msg.sender?.fullName || msg.sender?.username}
                        </span>

                        {role === "superadmin" ? (
                          <Crown className="h-3 w-3 text-amber-400 shrink-0 inline" />
                        ) : role === "admin" ? (
                          <span className="text-[8px] font-extrabold text-amber-500 bg-amber-500/10 px-1 rounded">
                            Admin
                          </span>
                        ) : null}

                        <span>•</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Reply Action Button */}
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-0.5 rounded text-textSecondary hover:text-primary cursor-pointer ms-1"
                          title={isArabic ? "رد" : "Reply"}
                        >
                          <Reply className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs break-words leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-xs shadow-sm"
                            : "bg-bgPrimary border border-borderPrimary/60 text-textPrimary rounded-bl-xs"
                        }`}
                      >
                        {/* Replied Message Quote Header */}
                        {msg.replyTo && (
                          <div
                            className={`mb-2 p-2 rounded-xl text-[11px] border-s-2 text-start ${
                              isMe
                                ? "bg-black/15 border-white/70 text-white/90"
                                : "bg-bgSecondary/90 border-primary text-textSecondary"
                            }`}
                          >
                            <span className="font-bold block truncate text-[10px] opacity-90">
                              {msg.replyTo.sender?.fullName ||
                                msg.replyTo.sender?.username ||
                                (isArabic ? "مستخدم" : "User")}
                            </span>
                            <p className="truncate text-[10px] opacity-80">
                              {msg.replyTo.content}
                            </p>
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview Bar */}
          {replyingTo && (
            <div className="px-3.5 py-2 bg-bgPrimary border-t border-borderPrimary/60 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 overflow-hidden">
                <Reply className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="truncate text-[11px]">
                  <span className="font-bold text-primary me-1">
                    {isArabic ? "الرد على" : "Replying to"}{" "}
                    {replyingTo.sender?.fullName || replyingTo.sender?.username}:
                  </span>
                  <span className="text-textSecondary opacity-80 truncate">
                    {replyingTo.content}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1 text-textSecondary hover:text-textPrimary hover:bg-bgSecondary rounded-lg cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-borderPrimary/60 bg-bgPrimary/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                isArabic
                  ? "اكتب رسالة للجميع..."
                  : "Type a public message..."
              }
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 outline-none focus:ring-2 focus:ring-primary shadow-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!messageText.trim() || sendMutation.isPending}
              className="rounded-xl px-3 h-8.5 text-xs font-bold gap-1 cursor-pointer"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
