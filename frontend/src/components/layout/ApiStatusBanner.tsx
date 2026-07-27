"use client";

import { WifiOff } from "lucide-react";
import { useApiHealth } from "@/hooks/useApiHealth";

// Surfaces a persistent, unmissable banner the moment the backend becomes
// unreachable, instead of letting every page quietly fall back to "no
// results" / "not found" states that look like legitimate empty data.
export default function ApiStatusBanner() {
  const { isError, isLoading } = useApiHealth();

  if (isLoading || !isError) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-error px-4 py-2 text-center text-sm font-semibold text-white">
      <WifiOff size={15} />
      {`Can't reach the Nomly server right now. Make sure the backend is running at ${
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
      } -- pages may show stale or empty data until it's back.`}
    </div>
  );
}
