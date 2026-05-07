// hooks/useUploadSource.ts
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useUploadSource = () => {
  const generateUploadUrl = useMutation(api.sources.generateUploadUrl);
  const createFileSource = useMutation(api.sources.createFileSource);
  const createTextSource = useMutation(api.sources.createTextSource);
  const createUrlSource = useMutation(api.sources.createUrlSource);
  const createYoutubeSource = useMutation(api.sources.createYoutubeSource);

  const uploadPdf = async (file: File, notebookId: Id<"notebooks">) => {
    if (file.size > 10 * 1024 * 1024) throw new Error("File must be under 10MB");
    if (file.type !== "application/pdf") throw new Error("Only PDF files allowed");

    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { storageId } = await res.json();

    return await createFileSource({
      notebookId,
      title: file.name.replace(".pdf", ""),
      type: "pdf",
      storageId,
    });
  };

  const uploadText = async (
    title: string,
    text: string,
    notebookId: Id<"notebooks">
  ) => {
    if (!text.trim()) throw new Error("Text cannot be empty");
    return await createTextSource({ notebookId, title, text });
  };

  const uploadUrl = async (url: string, notebookId: Id<"notebooks">) => {
    if (!url.startsWith("http")) throw new Error("Invalid URL");
    return await createUrlSource({ notebookId, url });
  };

  const uploadYoutube = async (
    url: string,
    title: string,
    notebookId: Id<"notebooks">
  ) => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be"))
      throw new Error("Invalid YouTube URL");
    return await createYoutubeSource({ notebookId, url, title });
  };

  return { uploadPdf, uploadText, uploadUrl, uploadYoutube };
};