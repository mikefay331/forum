import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import { Calendar } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  threadCount?: number;
  postCount?: number;
}

export default function ProfileCard({
  profile,
  threadCount = 0,
  postCount = 0,
}: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name ?? profile.username}
          size="xl"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.display_name ?? profile.username}
            </h1>
            <Badge role={profile.role} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            @{profile.username}
          </p>
          {profile.bio && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {profile.bio}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {threadCount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Threads</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {postCount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Replies</p>
        </div>
      </div>
    </div>
  );
}
