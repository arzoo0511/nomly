import { ShieldCheck } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { HostMini } from "@/types";

export default function HostCard({ host }: { host: HostMini }) {
  const memberSinceYear = new Date(host.created_at).getFullYear();

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border-subtle p-5">
      <Avatar seed={host.avatar_seed} name={host.full_name} size={56} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-ink-900">Hosted by {host.full_name}</p>
        </div>
        {host.is_superhost && (
          <Badge tone="brand" className="w-fit">
            <ShieldCheck size={13} /> Superhost
          </Badge>
        )}
        <p className="text-sm text-ink-500">Member since {memberSinceYear}</p>
        {host.bio && <p className="mt-2 max-w-md text-sm text-ink-700">{host.bio}</p>}
      </div>
    </div>
  );
}
