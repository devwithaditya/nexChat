import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import type { Conversation, Message } from "@/lib/chat-data";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import { useLayoutEffect } from "react";

export function ChatWindow({
  conversation,
  messages,
  onSend,
  onlineUsers,
}: {
  conversation: Conversation;
  messages: Message[];
  onSend: (text: string) => void;
  onlineUsers?: string[];
}) {
  const { currentUser } = useAuth();

  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const hasLoadedRef = useRef(false);

  useLayoutEffect(() => {
  if (!scrollRef.current) return;

  // 👉 only scroll when messages actually exist
  if (messages.length === 0) return;

  if (!hasLoadedRef.current) {
    // ✅ first load → instant
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    hasLoadedRef.current = true;
  } else {
    // ✅ new message → smooth
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [messages]);

useEffect(() => {
  hasLoadedRef.current = false;
}, [conversation.id]);

  // 🔥 reset typing when switching chat
  useEffect(() => {
    setIsTyping(false);
  }, [conversation.name]);

  // 🔥 FIXED typing listener (IMPORTANT)
  useEffect(() => {
    let timeout: any;

    const handleTyping = (data: any) => {
      const sender = data.sender?.toLowerCase().trim();
      const other = conversation.name?.toLowerCase().trim();

      if (sender === other) {
        setIsTyping(true);

        // reset timer every time typing event comes
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500); // 👈 smooth delay
      }
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  }, [conversation.name]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;

    onSend(text);
    setDraft("");
  };

  const isOnline = onlineUsers?.includes(conversation.name);

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-panel">
      
      {/* HEADER */}
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        
        <div className="relative">
          <Avatar initials={conversation.initials} tone={conversation.avatarTone} />

          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-panel"></span>
          )}
        </div>

        <div>
          <div className="text-lg font-semibold">{conversation.name}</div>

          {/* 🔥 STATUS / TYPING */}
          <div className="text-sm">
            <span
              className={cn(
                isTyping
                  ? "text-green-500"
                  : isOnline
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            >
              {isTyping
                ? "typing..."
                : isOnline
                ? "online"
                : "offline"}
            </span>
          </div>
        </div>
      </header>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 custom-scroll">
        <div className="mb-6 text-center text-sm text-muted-foreground">
          Today
        </div>

        <ul className="space-y-4">
          {messages.map((m) => {
            const mine = m.authorId === "me";

            return (
              <li
                key={m.id}
                className={cn(
                  "flex items-end gap-3",
                  mine ? "justify-end" : "justify-start"
                )}
              >
                {!mine && (
                  <Avatar
                    initials={conversation.initials}
                    tone={conversation.avatarTone}
                    size="sm"
                  />
                )}

                <div
                  className={cn(
                    "flex max-w-[70%] flex-col",
                    mine ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm",
                      mine
                        ? "bg-bubble-out text-bubble-out-foreground"
                        : "bg-bubble-in text-bubble-in-foreground"
                    )}
                  >
                    {m.text}
                  </div>

                  <span className="mt-1 text-xs text-muted-foreground">
                    {new Date(m.time).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* INPUT */}
      <footer className="flex items-center gap-3 border-t border-border px-6 py-4">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);

            if (!currentUser) return;

            // 🔥 emit typing ONLY (no stop_typing anymore)
            socket.emit("typing", {
              sender: currentUser.username.toLowerCase().trim(),
              receiver: conversation.name.toLowerCase().trim(),
            });
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-border bg-panel-2 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />

        <button
          onClick={submit}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-panel-2 hover:bg-accent"
        >
          <Send className="h-4 w-4" />
        </button>
      </footer>
    </section>
  );
}