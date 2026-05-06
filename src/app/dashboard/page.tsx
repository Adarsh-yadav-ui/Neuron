"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, Pencil, Trash2, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

type Notebook = {
  _id: Id<"notebooks">;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  sourceCount: number;
};

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NotebookSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-5 min-h-35 flex flex-col justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex justify-between mt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function NotebookCard({
  notebook,
  onEdit,
  onDelete,
}: {
  notebook: Notebook;
  onEdit: (nb: Notebook) => void;
  onDelete: (nb: Notebook) => void;
}) {
  const router = useRouter();

  return (
    <div
      className="group bg-card border rounded-xl p-5 cursor-pointer transition-all hover:border-foreground/20 hover:shadow-sm relative flex flex-col justify-between min-h-35"
      onClick={() => router.push(`/notebook/${notebook._id}`)}
    >
      {/* Actions */}
      <div
        className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          aria-label="Edit notebook"
          onClick={() => onEdit(notebook)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          aria-label="Delete notebook"
          onClick={() => onDelete(notebook)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-semibold text-foreground truncate mb-1 pr-16">
          {notebook.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-8">
          {notebook.description || (
            <span className="italic text-muted-foreground/50">
              No description
            </span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          {notebook.sourceCount} source{notebook.sourceCount !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-muted-foreground/50">
          {fmt(notebook.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const notebooks = useQuery(api.notebooks.getUserNotebooksWithCount);
  const createNotebook = useMutation(api.notebooks.createNotebook);
  const updateNotebook = useMutation(api.notebooks.updateNotebook);
  const deleteNotebook = useMutation(api.notebooks.deleteNotebook);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Notebook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notebook | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setTitle("");
    setDesc("");
    setCreateOpen(true);
  };

  const openEdit = (nb: Notebook) => {
    setEditTarget(nb);
    setTitle(nb.title);
    setDesc(nb.description ?? "");
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createNotebook({
        title: title.trim(),
        description: desc.trim() || undefined,
      });
      setCreateOpen(false);
      toast.success("Notebook created");
    } catch {
      toast.error("Failed to create notebook");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget || !title.trim()) return;
    setSaving(true);
    try {
      await updateNotebook({
        notebookId: editTarget._id,
        title: title.trim(),
        description: desc.trim() || undefined,
      });
      setEditTarget(null);
      toast.success("Notebook updated");
    } catch {
      toast.error("Failed to update notebook");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteNotebook({ notebookId: deleteTarget._id });
      setDeleteTarget(null);
      toast.success("Notebook deleted");
    } catch {
      toast.error("Failed to delete notebook");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = notebooks === undefined;

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Topbar */}
        <nav className="flex items-center justify-between px-8 py-4 border-b bg-background sticky top-0 z-10">
          <span className="text-[20px] font-semibold tracking-tight">
            Neuron{" "}
            <span className="text-[17px] font-normal text-muted-foreground">
              / notebooks
            </span>
          </span>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-medium">
              <UserButton />
            </div>
            <AnimatedThemeToggler className="mx-auto ml-4" duration={300}/>
          </div>
        </nav>

        {/* Main */}
        <main className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Your notebooks
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading
                  ? "Loading..."
                  : `${notebooks.length} notebook${notebooks.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New notebook
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <NotebookSkeleton key={i} />
              ))
            ) : notebooks.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-3xl mb-3">📓</p>
                <p className="text-sm text-muted-foreground">
                  No notebooks yet. Create one to get started.
                </p>
              </div>
            ) : (
              notebooks.map((nb) => (
                <NotebookCard
                  key={nb._id}
                  notebook={nb}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))
            )}

            {!isLoading && (
              <div
                role="button"
                aria-label="New notebook"
                onClick={openCreate}
                className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 min-h-35 cursor-pointer hover:border-foreground/30 hover:bg-muted/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground">
                  New notebook
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                placeholder="My research..."
                maxLength={60}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-desc">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="create-desc"
                placeholder="What's this notebook about?"
                className="resize-none h-20"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !title.trim()} onClick={handleCreate}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                maxLength={60}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="edit-desc"
                className="resize-none h-20"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button disabled={saving || !title.trim()} onClick={handleUpdate}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" and all its sources will be permanently
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
              onClick={handleDelete}
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
