import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
  xl: "w-20 h-20 text-2xl",
};

const pxSizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

export default function Avatar({
  src,
  alt = "User",
  size = "md",
  className,
}: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pxSizes[size]}
          height={pxSizes[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
