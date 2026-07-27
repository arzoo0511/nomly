import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ErrorState({
  message = "We couldn't reach the Nomly server. Check that the backend is running, then try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle size={28} />
      </div>
      <p className="text-lg font-semibold text-ink-900">Something went wrong</p>
      <p className="max-w-sm text-sm text-ink-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
