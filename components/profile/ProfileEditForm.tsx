"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Avatar from "@/components/ui/Avatar";
import type { Profile } from "@/lib/types/database";

interface ProfileEditFormProps {
  profile: Profile;
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const { refreshProfile } = useAuth();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Profile updated!", "success");
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar
          src={avatarUrl || null}
          alt={displayName || profile.username}
          size="lg"
        />
        <Input
          label="Avatar URL"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="flex-1"
        />
      </div>

      <Input
        label="Display Name"
        placeholder="Your display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={50}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
        </label>
        <input
          value={profile.username}
          disabled
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-500 dark:text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">Username cannot be changed</p>
      </div>

      <Textarea
        label="Bio"
        placeholder="Tell the community about yourself..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        maxLength={500}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
