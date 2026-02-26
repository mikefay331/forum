import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConversationView from "@/components/messages/ConversationView";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export const metadata: Metadata = { title: "Conversation" };

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sender: any;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  let isParticipant = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let otherUser: any = null;
  let messages: MessageRow[] = [];

  try {
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", session.user.id)
      .single();

    if (!participant) return notFound();
    isParticipant = true;

    const [otherParticipantResult, messagesResult] = await Promise.all([
      supabase
        .from("conversation_participants")
        .select("*, profile:profiles(id, username, display_name, avatar_url, role)")
        .eq("conversation_id", conversationId)
        .neq("user_id", session.user.id)
        .single(),
      supabase
        .from("direct_messages")
        .select("*, sender:profiles(id, username, display_name, avatar_url, role)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    otherUser = (otherParticipantResult.data as any)?.profile ?? null;
    messages = (messagesResult.data ?? []) as MessageRow[];

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", session.user.id);
  } catch {
    if (!isParticipant) return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ConversationView
        conversationId={conversationId}
        currentUserId={session.user.id}
        otherUser={otherUser}
        initialMessages={messages}
      />
    </div>
  );
}
