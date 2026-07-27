import type { LucideIcon } from "lucide-react";

// Minimal icon treatment for empty/404/coming-soon states, in the spirit of
// Airbnb's own restrained empty states (a simple icon, not an illustrated scene).
export default function TravelIllustration({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-100 text-ink-500">
      <Icon size={34} strokeWidth={1.5} />
    </div>
  );
}
