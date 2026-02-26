"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { ShoutboxMessage } from "@/lib/types/database";
import { Send, MessageSquare } from "lucide-react";

export default function Shoutbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ShoutboxMessage[]>([]);
  const [channel, setChannel] = useState<"general" | "marketplace">("general");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasTable, setHasTable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!hasTable) return;
    const sub = supabase
      .channel("shoutbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shoutbox_messages", filter: `channel=eq.${channel}` },
        async (payload) => {
          const msg = payload.new as ShoutboxMessage;
          const { data: author } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, role")
            .eq("id", msg.user_id)
            .single();
          setMessages((prev) => [...prev.slice(-49), { ...msg, author: author as ShoutboxMessage["author"] ?? undefined }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, hasTable]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("shoutbox_messages")
        .select("*, author:profiles(id, username, display_name, avatar_url, role)")
        .eq("channel", channel)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === "42P01") { setHasTable(false); return; }
        return;
      }
      setMessages((data ?? []).reverse() as ShoutboxMessage[]);
    } catch {
      setHasTable(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;
    setLoading(true);
    try {
      await supabase.from("shoutbox_messages").insert({
        user_id: user.id,
        content: input.trim(),
        channel,
      });
      setInput("");
    } finally {
      setLoading(false);
    }
  }

  const roleColors: Record<string, string> = {
    admin: "text-red-400",
    moderator: "text-blue-400",
    member: "text-teal-300",
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/50" style={{ background: "#232b3e" }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-white">Shoutbox</span>
        </div>
        <div className="flex gap-1">
          {(["general", "marketplace"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                channel === ch
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              style={channel === ch ? { background: "#2a9d8f" } : {}}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto px-3 py-2 space-y-1.5 text-sm">
        {!hasTable ? (
          <p className="text-gray-500 text-xs text-center py-4">Shoutbox feature coming soon!</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">No messages yet. Be the first to shout!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar src={msg.author?.avatar_url} alt={msg.author?.username ?? ""} size="xs" />
              <div className="min-w-0">
                <span className={`font-semibold text-xs mr-1.5 ${roleColors[msg.author?.role ?? "member"] ?? "text-teal-300"}`}>
                  {msg.author?.display_name ?? msg.author?.username ?? "Unknown"}
                </span>
                <span className="text-gray-300 break-words">{msg.content}</span>
                <span className="text-gray-600 text-xs ml-1.5">{formatRelativeTime(msg.created_at)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-gray-700/50">
        {user ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 px-3 py-1.5 rounded text-sm text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-teal-500"
              style={{ background: "#1a1f2e" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-1.5 rounded text-sm text-white disabled:opacity-50 transition-colors"
              style={{ background: "#2a9d8f" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-500 text-center py-1">
            <a href="/auth/login" className="text-teal-400 hover:text-teal-300">Login</a> to post in the shoutbox
          </p>
        )}
      </div>
    </div>
  );
}
