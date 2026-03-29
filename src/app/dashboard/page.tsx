"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Mic, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ChatView, type ChatMessage } from "@/components/chat-view";

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/user/subscription");
        const data = await res.json();
        setHasSubscription(data.hasSubscription);

        if (!data.hasSubscription) {
          router.push("/subscribe");
        }
      } catch {
        setHasSubscription(false);
        router.push("/subscribe");
      }
    };

    if (isSignedIn) {
      checkSubscription();
      loadRecords();
    }
  }, [isSignedIn, isLoaded, router]);

  const loadRecords = async () => {
    try {
      const res = await fetch("/api/records");
      const data = await res.json();

      const chatMessages: ChatMessage[] = [];
      for (const record of data.records || []) {
        chatMessages.push({
          id: `${record.id}-user`,
          type: "user",
          content: record.transcription,
          createdAt: new Date(record.createdAt),
        });
        if (record.chatResponse) {
          chatMessages.push({
            id: `${record.id}-assistant`,
            type: "assistant",
            content: record.chatResponse,
            createdAt: new Date(record.createdAt),
          });
        }
      }
      setMessages(chatMessages);
    } catch (error) {
      console.error("Failed to load records:", error);
    }
  };

  const handleTranscription = useCallback(
    (text: string, chatResponse?: string) => {
      const id = Date.now().toString();
      const newMessages: ChatMessage[] = [
        {
          id: `${id}-user`,
          type: "user",
          content: text,
          createdAt: new Date(),
        },
      ];
      if (chatResponse) {
        newMessages.push({
          id: `${id}-assistant`,
          type: "assistant",
          content: chatResponse,
          createdAt: new Date(),
        });
      }
      setMessages((prev) => [...prev, ...newMessages]);
    },
    []
  );

  if (!isLoaded || hasSubscription === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!hasSubscription) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <span className="font-bold">VoiceScribe</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Home
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto flex h-full max-w-3xl flex-col">
          <ChatView messages={messages} />
        </div>
      </div>

      {/* Recorder Bar */}
      <div className="border-t bg-background p-4">
        <div className="container mx-auto max-w-3xl">
          <VoiceRecorder onTranscription={handleTranscription} />
        </div>
      </div>
    </div>
  );
}
