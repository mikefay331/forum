"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sender: any;
}

interface OtherUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  otherUser: OtherUser | null;
  initialMessages: Message[];
}

export default function ConversationView({ conversationId, currentUserId, otherUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const sub = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id !== currentUserId) {
            const { data: sender } = await supabase
              .from("profiles")
              .select("id, username, display_name, avatar_url, role")
              .eq("id", msg.sender_id)
              .single();
            setMessages((prev) => [...prev, { ...msg, sender }]);
            await supabase.from("direct_messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("direct_messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, content: input.trim() })
        .select("*, sender:profiles(id, username, display_name, avatar_url, role)")
        .single();
      if (data) setMessages((prev) => [...prev, data as Message]);
      setInput("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50" style={{ background: "#232b3e" }}>
        <Link href="/messages" className="text-gray-400 hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otherUser && (
          <>
            <Avatar src={otherUser.avatar_url} alt={otherUser.username} size="sm" />
            <div>
              <p className="font-semibold text-sm text-white">{otherUser.display_name ?? otherUser.username}</p>
              <p className="text-xs text-gray-400">@{otherUser.username}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[600px]">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              {!isMine && <Avatar src={msg.sender?.avatar_url} alt={msg.sender?.username ?? ""} size="xs" />}
              <div
                className={`rounded-xl px-4 py-2 max-w-xs lg:max-w-md text-sm ${isMine ? "text-white" : "text-gray-200"}`}
                style={{ background: isMine ? "#2a9d8f" : "#232b3e" }}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-teal-100" : "text-gray-500"}`}>{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-gray-700/50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 px-3 py-2 rounded text-sm text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-teal-500"
          style={{ background: "#1a1f2e" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors"
          style={{ background: "#2a9d8f" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
