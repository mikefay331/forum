import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shield } from "lucide-react";
import Link from "next/link";
import NewThreadForm from "@/components/forum/NewThreadForm";

export const metadata: Metadata = { title: "Admin — Announcements" };

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (!me || me.role !== "admin") redirect("/");

  const { data: announcementsCategory } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", "announcements")
    .single();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin" className="text-gray-400 hover:text-gray-200 text-sm">Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white">Announcements</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-bold text-white">Create Announcement</h1>
      </div>
      {announcementsCategory ? (
        <div className="rounded-xl p-6 border border-gray-700/50" style={{ background: "#1e2537" }}>
          <p className="text-sm text-gray-400 mb-4">Creating announcement in: <span className="text-teal-400 font-semibold">{announcementsCategory.name}</span></p>
          <NewThreadForm preselectedCategoryId={announcementsCategory.id} />
        </div>
      ) : (
        <div className="rounded-xl p-6 border border-gray-700/50 text-center" style={{ background: "#1e2537" }}>
          <p className="text-gray-400">No announcements category found. Create one in Category Management first.</p>
        </div>
      )}
    </div>
  );
}
