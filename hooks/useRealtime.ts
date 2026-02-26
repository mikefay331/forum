"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
}

export function useRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `${table}-${filter ?? "all"}-${Date.now()}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel = supabase.channel(channelName).on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        if (payload.eventType === "INSERT" && onInsert) onInsert(payload.new);
        if (payload.eventType === "UPDATE" && onUpdate) onUpdate(payload.new);
        if (payload.eventType === "DELETE" && onDelete) onDelete(payload.old);
      }
    );

    channel = channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);
}
