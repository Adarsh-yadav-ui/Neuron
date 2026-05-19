"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground/20 mb-4">500</p>
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-3">
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
        <Button
          size="sm"
          variant="outline"
          render={() => <a href="/dashboard">Go to dashboard</a>}
        />
      </div>
    </div>
  );
}
