import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import TravelIllustration from "@/components/ui/TravelIllustration";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <TravelIllustration icon={Icon} />
      <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
      <p className="max-w-md text-ink-600">{description}</p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-2")}>
        Back to exploring
      </Link>
    </div>
  );
}
