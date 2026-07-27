import { MessageCircle } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function MessagesPage() {
  return (
    <ComingSoon
      icon={MessageCircle}
      title="Messaging is coming soon"
      description="Direct messaging between guests and hosts isn't part of this demo yet. For now, trip and listing details are visible in My Trips and your Host Dashboard."
    />
  );
}
