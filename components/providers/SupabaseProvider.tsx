"use client";

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SupabaseContext = createContext<SupabaseClient<any> | null>(null);

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => createClient());
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}
