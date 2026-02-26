export const APP_NAME = "ForumHub";
export const APP_DESCRIPTION = "A modern community discussion platform";
export const THREADS_PER_PAGE = 10;
export const POSTS_PER_PAGE = 20;

export const THREAD_SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Most Popular", value: "popular" },
  { label: "Most Replies", value: "replies" },
  { label: "Unanswered", value: "unanswered" },
] as const;

export const USER_ROLES = {
  admin: "Admin",
  moderator: "Moderator",
  member: "Member",
} as const;

export const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  moderator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  member: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
} as const;
