import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminAdvertisements from "@/components/admin/AdminAdvertisements";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import type { Advertisement } from "@/lib/types/database";

export const metadata: Metadata = { title: "Admin — Advertisements" };

export default async function AdminAdvertisementsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (!me || me.role !== "admin") redirect("/");

  let ads: Advertisement[] = [];
  try {
    const { data } = await supabase.from("advertisements").select("*").order("sort_order", { ascending: true });
    ads = (data ?? []) as Advertisement[];
  } catch { ads = []; }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin" className="text-gray-400 hover:text-gray-200 text-sm">Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white">Advertisements</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-bold text-white">Advertisement Management</h1>
      </div>
      <AdminAdvertisements ads={ads} />
    </div>
  );
}
