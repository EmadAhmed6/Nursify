"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/_components/Navbar";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Crown,
  Users,
  Sparkles,
  Reply,
  X,
} from "lucide-react";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  useGetGlobalMessages,
  useSendGlobalMessage,
} from "@/_features/chat/hooks";
import type { GlobalChatMessage } from "@/_features/chat/types";
import { useLanguage } from "@/context/LanguageContext";

export default function ChatPage() {
  const { isArabic } = useLanguage();
  const { data: currentUser } = useGetAuthMeQuery();
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState<GlobalChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: messages = [], isLoading } = useGetGlobalMessages();
  const sendMutation = useSendGlobalMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

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

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col">
        {/* Chat Window Container */}
        <div className="flex-1 flex flex-col h-[75vh] glass-card rounded-3xl border border-borderPrimary/60 shadow-xl overflow-hidden bg-bgSecondary/70 backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-borderPrimary/60 bg-bgPrimary/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/15 text-primary shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Text as="h1" size="default" font="black" color="primary">
                    {isArabic ? "غرفة المحادثة العامة" : "Public Chat Room"}
                  </Text>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <Text as="p" size="xs" color="secondary" className="text-[11px]">
                  {isArabic
                    ? "ملتقى طلاب التمريض للمناقشات الدراسية والاستفسارات"
                    : "Nursing student forum for clinical discussions and queries"}
                </Text>
              </div>
            </div>

            <span className="text-xs font-bold text-textSecondary bg-bgSecondary px-3 py-1.5 rounded-xl border border-borderPrimary/50">
              {messages.length} {isArabic ? "رسالة" : "messages"}
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
            {isLoading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-textSecondary opacity-60">
                <MessageSquare className="h-12 w-12 mb-3 opacity-30 text-primary" />
                <Text as="h3" size="default" font="bold" color="primary" className="mb-1">
                  {isArabic ? "لا توجد رسائل سابقة" : "No Messages Yet"}
                </Text>
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "كن أول من يرحب بزملائه أو يطرح سؤالاً دراسياً في الغرفة العامة!"
                    : "Be the first to say hello or ask a nursing study question!"}
                </Text>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?._id;
                const role = msg.sender?.role;

                return (
                  <div
                    key={msg._id}
                    className={`group/msg relative flex items-start gap-3 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    {msg.sender?.profilePicture?.url ? (
                      <img
                        src={msg.sender.profilePicture.url}
                        alt={msg.sender.fullName || msg.sender.username}
                        className="h-8 w-8 rounded-full object-cover shrink-0 border border-borderPrimary/60 ring-2 ring-primary/10"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-primary/10">
                        <User className="h-4 w-4" />
                      </div>
                    )}

                    {/* Bubble Container */}
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Meta */}
                      <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-textSecondary">
                        <span className="font-bold text-textPrimary">
                          {isMe
                            ? isArabic
                              ? "أنت"
                              : "You"
                            : msg.sender?.fullName || msg.sender?.username}
                        </span>

                        {role === "superadmin" ? (
                          <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0 inline" />
                        ) : role === "admin" ? (
                          <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
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
                          <Reply className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm break-words leading-relaxed shadow-xs ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-xs"
                            : "bg-bgPrimary border border-borderPrimary/60 text-textPrimary rounded-bl-xs"
                        }`}
                      >
                        {/* Replied Message Quote Header */}
                        {msg.replyTo && (
                          <div
                            className={`mb-2 p-2.5 rounded-xl text-xs border-s-2 text-start ${
                              isMe
                                ? "bg-black/15 border-white/70 text-white/90"
                                : "bg-bgSecondary/90 border-primary text-textSecondary"
                            }`}
                          >
                            <span className="font-bold block truncate text-[11px] opacity-90">
                              {msg.replyTo.sender?.fullName ||
                                msg.replyTo.sender?.username ||
                                (isArabic ? "مستخدم" : "User")}
                            </span>
                            <p className="truncate text-[11px] opacity-80">
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
            <div className="px-5 py-2.5 bg-bgPrimary border-t border-borderPrimary/60 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 overflow-hidden">
                <Reply className="h-4 w-4 text-primary shrink-0" />
                <div className="truncate text-xs">
                  <span className="font-bold text-primary me-1.5">
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
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-borderPrimary/60 bg-bgPrimary/60 flex items-center gap-3"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                isArabic
                  ? "اكتب رسالة عامة للجميع..."
                  : "Type a public message for everyone..."
              }
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 outline-none focus:ring-2 focus:ring-primary shadow-xs"
            />
            <Button
              type="submit"
              disabled={!messageText.trim() || sendMutation.isPending}
              className="rounded-xl px-5 h-10 text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-md"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isArabic ? "إرسال" : "Send"}
              </span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
