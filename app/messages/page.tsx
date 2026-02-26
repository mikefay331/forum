import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Messages" };

interface ConversationRow {
  id: string;
  other: { username: string; display_name: string | null; avatar_url: string | null; role: string } | null;
  lastMessage: { content: string } | null;
  unreadCount: number;
  updatedAt: string | null;
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  let conversations: ConversationRow[] = [];
  try {
    const { data } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversation:conversations(id, updated_at)
      `)
      .eq("user_id", session.user.id)
      .order("conversation_id");

    if (data && data.length > 0) {
      const convDetails = await Promise.all(
        data.map(async (cp) => {
          const convId = cp.conversation_id;
          const [otherParticipant, lastMessage, unreadCount] = await Promise.all([
            supabase
              .from("conversation_participants")
              .select("*, profile:profiles(id, username, display_name, avatar_url, role)")
              .eq("conversation_id", convId)
              .neq("user_id", session.user.id)
              .single(),
            supabase
              .from("direct_messages")
              .select("*, sender:profiles(username, display_name)")
              .eq("conversation_id", convId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from("direct_messages")
              .select("id", { count: "exact", head: true })
              .eq("conversation_id", convId)
              .eq("is_read", false)
              .neq("sender_id", session.user.id),
          ]);
          return {
            id: convId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            other: (otherParticipant.data as any)?.profile ?? null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lastMessage: lastMessage.data as any,
            unreadCount: unreadCount.count ?? 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updatedAt: (cp.conversation as any)?.updated_at ?? null,
          };
        })
      );
      conversations = convDetails.filter(Boolean) as ConversationRow[];
    }
  } catch {
    conversations = [];
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-400" />
          Direct Messages
        </h1>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
        {conversations.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No conversations yet.</p>
            <p className="text-sm text-gray-500 mt-1">Visit a user profile to start a conversation.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <Avatar src={conv.other?.avatar_url} alt={conv.other?.username ?? ""} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">
                      {conv.other?.display_name ?? conv.other?.username ?? "Unknown"}
                    </span>
                    {conv.updatedAt && (
                      <span className="text-xs text-gray-500">{formatRelativeTime(conv.updatedAt)}</span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold" style={{ background: "#2a9d8f" }}>
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
