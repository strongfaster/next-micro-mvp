"use client";

import { useEffect, useRef } from "react";
import { Mic, Bot } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatViewProps {
  messages: ChatMessage[];
}

export function ChatView({ messages }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No recordings yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Record your voice and get instant transcriptions with AI insights
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 rounded-lg p-4",
            message.type === "user"
              ? "bg-primary/5"
              : "bg-muted"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              message.type === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-foreground/10"
            )}
          >
            {message.type === "user" ? (
              <Mic className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {message.type === "user" ? "Your transcription" : "AI Response"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(new Date(message.createdAt))}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
