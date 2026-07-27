import Image from "next/image";
import { avatarUrl } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function Avatar({
  seed,
  name,
  size = 40,
  className,
}: {
  seed: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-ink-200", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarUrl(seed, size * 2)}
        alt={name ? `${name}'s avatar` : "User avatar"}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}
