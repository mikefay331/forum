"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import { showToast } from "@/components/ui/Toast";

interface Props {
  users: Profile[];
  currentUserId: string;
}

export default function AdminUserList({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const supabase = createClient();

  const updateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) { showToast("Failed to update role", "error"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: role as Profile["role"] } : u));
    showToast("Role updated", "success");
  };

  const toggleShoutboxBan = async (userId: string, currentBanned: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_shoutbox_banned: !currentBanned }).eq("id", userId);
    if (error) { showToast("Failed to update ban status", "error"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_shoutbox_banned: !currentBanned } : u));
    showToast(!currentBanned ? "User shoutbox banned" : "User shoutbox unbanned", "success");
  };

  const roleColors: Record<string, string> = {
    admin: "text-red-400",
    moderator: "text-blue-400",
    member: "text-gray-300",
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">User</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Joined</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Shoutbox</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar_url} alt={user.username} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{user.display_name ?? user.username}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-xs text-gray-400">{formatRelativeTime(user.created_at)}</span>
              </td>
              <td className="px-4 py-3">
                {user.id === currentUserId ? (
                  <span className={`text-xs font-semibold ${roleColors[user.role]}`}>{user.role}</span>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="text-xs rounded px-2 py-1 border border-gray-700 text-gray-300 focus:outline-none focus:border-teal-500"
                    style={{ background: "#232b3e" }}
                  >
                    <option value="member">member</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                )}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {user.id !== currentUserId && (
                  <button
                    onClick={() => toggleShoutboxBan(user.id, user.is_shoutbox_banned ?? false)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      user.is_shoutbox_banned
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {user.is_shoutbox_banned ? "Unban" : "Ban"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
