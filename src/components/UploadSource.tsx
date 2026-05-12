// components/sources/UploadSource.tsx
"use client";

import { useState, useRef } from "react";
import { useUploadSource } from "@/hooks/use-upload-source";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Link, Type, Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadSourceProps {
  notebookId: Id<"notebooks">;
  open: boolean;
  onClose: () => void;
}

export function UploadSource({ notebookId, open, onClose }: UploadSourceProps) {
  const { uploadPdf, uploadText, uploadUrl, uploadYoutube } = useUploadSource();

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Text state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  // URL state
  const [urlValue, setUrlValue] = useState("");

  // YouTube state
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");

  const [saving, setSaving] = useState(false);

  const reset = () => {
    setPdfFile(null);
    setTextTitle("");
    setTextContent("");
    setUrlValue("");
    setYtUrl("");
    setYtTitle("");
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── PDF ──
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") setPdfFile(file);
    else toast.error("Only PDF files allowed");
  };

  const handlePdfSubmit = async () => {
    if (!pdfFile) return;
    setSaving(true);
    try {
      await uploadPdf(pdfFile, notebookId);
      toast.success("PDF uploaded — processing started");
      handleClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Text ──
  const handleTextSubmit = async () => {
    if (!textTitle.trim() || !textContent.trim()) return;
    setSaving(true);
    try {
      await uploadText(textTitle, textContent, notebookId);
      toast.success("Text source added");
      handleClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── URL ──
  const handleUrlSubmit = async () => {
    if (!urlValue.trim()) return;
    setSaving(true);
    try {
      await uploadUrl(urlValue, notebookId);
      toast.success("URL added — processing started");
      handleClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── YouTube ──
  const handleYtSubmit = async () => {
    if (!ytUrl.trim()) return;
    setSaving(true);
    try {
      await uploadYoutube(ytUrl, ytTitle || ytUrl, notebookId);
      toast.success("YouTube video added — processing started");
      handleClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pdf" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger
              value="pdf"
              className="flex items-center gap-1.5 text-xs"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="flex items-center gap-1.5 text-xs"
            >
              <Type className="h-3.5 w-3.5" /> Text
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="flex items-center gap-1.5 text-xs"
            >
              <Link className="h-3.5 w-3.5" /> URL
            </TabsTrigger>
            <TabsTrigger
              value="youtube"
              className="flex items-center gap-1.5 text-xs"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </TabsTrigger>
          </TabsList>

          {/* ── PDF Tab ── */}
          <TabsContent value="pdf" className="mt-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !pdfFile && inputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                transition-all cursor-pointer min-h-40 gap-3 px-4 text-center
                ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"}
                ${pdfFile ? "cursor-default" : ""}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPdfFile(file);
                }}
              />
              {pdfFile ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfFile(null);
                    }}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop your PDF here
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      or click to browse • max 20MB
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={!pdfFile || saving} onClick={handlePdfSubmit}>
                {saving ? "Uploading..." : "Upload PDF"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── Text Tab ── */}
          <TabsContent value="text" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="text-title">Title</Label>
              <Input
                id="text-title"
                placeholder="Give this source a name..."
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                placeholder="Paste your text here..."
                className="resize-none h-32"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {textContent.length} characters
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!textTitle.trim() || !textContent.trim() || saving}
                onClick={handleTextSubmit}
              >
                {saving ? "Adding..." : "Add text"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── URL Tab ── */}
          <TabsContent value="url" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="url-input">Website URL</Label>
              <Input
                id="url-input"
                placeholder="https://example.com/article"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <p className="text-xs text-muted-foreground">
                We'll extract the text content from this page.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!urlValue.trim() || saving}
                onClick={handleUrlSubmit}
              >
                {saving ? "Adding..." : "Add URL"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── YouTube Tab ── */}
          <TabsContent value="youtube" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="yt-url">YouTube URL</Label>
              <Input
                id="yt-url"
                placeholder="https://youtube.com/watch?v=..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yt-title">
                Title{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="yt-title"
                placeholder="Video title..."
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleYtSubmit()}
              />
              <p className="text-xs text-muted-foreground">
                We'll extract the transcript from this video.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!ytUrl.trim() || saving}
                onClick={handleYtSubmit}
              >
                {saving ? "Adding..." : "Add video"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
