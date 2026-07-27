import { ShieldCheck } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function VerifyIdentityPage() {
  return (
    <ComingSoon
      icon={ShieldCheck}
      title="Identity verification is coming soon"
      description="Government ID checks and identity verification aren't part of this demo. All accounts are considered verified for the purposes of testing bookings and hosting."
    />
  );
}
