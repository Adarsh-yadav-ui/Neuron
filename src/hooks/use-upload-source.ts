import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { inngest } from "@/inngest/client";

const fireInngest = async (data: object) => {
  const url =
    process.env.NODE_ENV === "production"
      ? `https://inn.gs/e/${process.env.NEXT_PUBLIC_INNGEST_EVENT_KEY}`
      : "http://localhost:8288/e/key";

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "source/process", data }),
  });
};

export const useUploadSource = () => {
  const generateUploadUrl = useMutation(api.sources.generateUploadUrl);
  const createFileSource = useMutation(api.sources.createFileSource);
  const createTextSource = useMutation(api.sources.createTextSource);
  const createUrlSource = useMutation(api.sources.createUrlSource);
  const createYoutubeSource = useMutation(api.sources.createYoutubeSource);
  const getStorageUrl = useAction(api.sourceActions.getStorageUrl);

  // ── PDF ──
  const uploadPdf = async (file: File, notebookId: Id<"notebooks">) => {
    if (file.size > 40 * 1024 * 1024)
      throw new Error("File must be under 20MB");
    if (file.type !== "application/pdf")
      throw new Error("Only PDF files allowed");

    // 1. Upload URL lo
    const uploadUrl = await generateUploadUrl();

    // 2. Convex Storage mein upload
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { storageId } = await res.json();

    // 3. Source metadata save
    const sourceId = await createFileSource({
      notebookId,
      title: file.name.replace(".pdf", ""),
      type: "pdf",
      storageId,
    });

    // 4. StorageUrl lo
    const storageUrl = await getStorageUrl({ sourceId });

    // 5. Inngest trigger — fire and forget
    fireInngest({ sourceId, type: "pdf", storageUrl, url: null, notebookId });

    return sourceId;
  };

  // ── Text ── (no Inngest needed)
  const uploadText = async (
    title: string,
    text: string,
    notebookId: Id<"notebooks">,
  ) => {
    if (!text.trim()) throw new Error("Text cannot be empty");
    return await createTextSource({ notebookId, title, text });
  };

  // ── URL ──
  const uploadUrl = async (url: string, notebookId: Id<"notebooks">) => {
    if (!url.startsWith("http")) throw new Error("Invalid URL");

    const sourceId = await createUrlSource({ notebookId, url });

    fireInngest({ sourceId, type: "url", storageUrl: null, url, notebookId });

    return sourceId;
  };

  // ── YouTube ──
  const uploadYoutube = async (
    url: string,
    title: string,
    notebookId: Id<"notebooks">,
  ) => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be"))
      throw new Error("Invalid YouTube URL");

    const sourceId = await createYoutubeSource({ notebookId, url, title });

    fireInngest({
      sourceId,
      type: "youtube",
      storageUrl: null,
      url,
      notebookId,
    });

    return sourceId;
  };

  return { uploadPdf, uploadText, uploadUrl, uploadYoutube };
};
