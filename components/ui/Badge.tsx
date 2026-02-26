import { cn } from "@/lib/utils";
import { USER_ROLES, ROLE_COLORS } from "@/lib/constants";
import type { UserRole } from "@/lib/types/database";

interface BadgeProps {
  children?: React.ReactNode;
  role?: UserRole;
  variant?: "default" | "pinned" | "locked" | "category";
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  role,
  variant = "default",
  color,
  className,
}: BadgeProps) {
  if (role) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          ROLE_COLORS[role],
          className
        )}
      >
        {USER_ROLES[role]}
      </span>
    );
  }

  const variants = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    pinned: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    locked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    category: color ? "" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      style={
        variant === "category" && color
          ? {
              backgroundColor: `${color}20`,
              color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
