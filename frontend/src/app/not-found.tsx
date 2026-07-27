import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import TravelIllustration from "@/components/ui/TravelIllustration";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <TravelIllustration icon={Compass} />
      <h1 className="text-3xl font-extrabold text-ink-900">Looks like you&apos;re off the map</h1>
      <p className="max-w-md text-ink-600">
        We couldn&apos;t find the page you were looking for. Even the best explorers take a wrong turn sometimes.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-2")}>
        Back to exploring
      </Link>
    </div>
  );
}
