"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { UploadSource } from "@/components/UploadSource";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FileText,
  Link,
  Type,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

type Source = {
  _id: Id<"sources">;
  title: string;
  type: "pdf" | "text" | "url" | "youtube";
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: number;
  url?: string;
};

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SourceIcon({ type }: { type: Source["type"] }) {
  const cls = "h-4 w-4";
  if (type === "pdf") return <FileText className={cls} />;
  if (type === "text") return <Type className={cls} />;
  if (type === "youtube")
    return (
      <svg
        className={cls}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  return <Link className={cls} />;
}

function StatusBadge({ status }: { status: Source["status"] }) {
  if (status === "ready")
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
        <CheckCircle className="h-3 w-3" /> Ready
      </span>
    );
  if (status === "processing")
    return (
      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
        <Loader2 className="h-3 w-3 animate-spin" /> Processing
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

function SourceCard({ source }: { source: Source }) {
  const deleteSource = useMutation(api.sources.deleteSource);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSource({ sourceId: source._id });
      toast.success("Source deleted");
    } catch {
      toast.error("Failed to delete source");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group flex items-center justify-between bg-card border rounded-xl px-4 py-3 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
          <SourceIcon type={source.type} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {source.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fmt(source.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <StatusBadge status={source.status} />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete source"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function SourceSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

const Page = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const [sourceOpen, setSourceOpen] = useState(false);

  const notebookSources = useQuery(api.sources.getNotebookSources, {
    notebookId: notebookId as Id<"notebooks">,
  });

  const isLoading = notebookSources === undefined;

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-4 border-b bg-background sticky top-0 z-10">
        <span className="text-base font-semibold tracking-tight">
          Neuron{" "}
          <span className="font-normal text-muted-foreground">/ notebook</span>
        </span>
        <Button size="sm" className="gap-2" onClick={() => setSourceOpen(true)}>
          <Plus className="h-4 w-4" />
          Add source
        </Button>
      </nav>

      <main className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Sources</h2>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? "..."
              : `${notebookSources.length} source${notebookSources.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SourceSkeleton key={i} />)
          ) : notebookSources.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <p className="text-3xl mb-3">📄</p>
              <p className="text-sm font-medium text-foreground mb-1">
                No sources yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Add a PDF, text, URL, or YouTube video to get started.
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setSourceOpen(true)}
              >
                <Plus className="h-4 w-4" /> Add source
              </Button>
            </div>
          ) : (
            notebookSources.map((source) => (
              <SourceCard key={source._id} source={source as Source} />
            ))
          )}
        </div>
      </main>

      <UploadSource
        notebookId={notebookId as Id<"notebooks">}
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
      />
    </div>
  );
};

export default Page;
