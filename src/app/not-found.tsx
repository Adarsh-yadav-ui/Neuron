import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground/20 mb-4">404</p>
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button  size="sm">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}