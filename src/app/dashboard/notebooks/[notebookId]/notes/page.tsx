"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { NotesEditor } from "@/components/notesEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

export default function NotesPage() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const router = useRouter();

  const notebook = useQuery(api.notebooks.getNotebook, {
    notebookId: notebookId as Id<"notebooks">,
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold tracking-tight">
            Neuron{" "}
            <span className="font-normal text-muted-foreground">
              / {notebook?.title ?? "notebook"} / notes
            </span>
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-6">
        <NotesEditor notebookId={notebookId as Id<"notebooks">} />
      </main>
    </div>
  );
}