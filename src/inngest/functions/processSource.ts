import { inngest } from "../client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { YoutubeTranscript } from "youtube-transcript";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const processSource = inngest.createFunction(
  {
    id: "process-source",
    triggers: { event: "source/process" },
    onFailure: async ({ error, event }) => {
      const { sourceId } = event.data.event.data;
      await convex.mutation(api.sources.updateSourceStatus, {
        sourceId: sourceId as Id<"sources">,
        status: "failed",
      });
    },
  },
  async ({ event, step }: any) => {
    const { sourceId, type, storageUrl, url } = event.data as {
      sourceId: string;
      type: "pdf" | "url" | "youtube";
      storageUrl: string | null;
      url: string | null;
    };

    await step.run("mark-processing", async () => {
      await convex.mutation(api.sources.updateSourceStatus, {
        sourceId: sourceId as Id<"sources">,
        status: "processing",
      });
    });

    const extractedText = await step.run("extract-text", async () => {
      if (type === "pdf") {
        const res = await fetch(storageUrl!);
        const arrayBuffer = await res.arrayBuffer();

        const { extractText } = await import("unpdf");
        const { text } = await extractText(new Uint8Array(arrayBuffer));

        return Array.isArray(text) ? text.join("\n") : text;
      }

      if (type === "url") {
        const res = await fetch(`https://r.jina.ai/${url}`);
        return await res.text();
      }

      if (type === "youtube") {
        try {
          const videoId =
            url!.split("v=")[1]?.split("&")[0] ?? url!.split("/").pop();
          const transcript = await YoutubeTranscript.fetchTranscript(videoId!);
          return transcript.map((t: any) => t.text).join(" ");
        } catch {
          throw new Error(
            "No captions found for this video. Please use a video with subtitles enabled.",
          );
        }
      }

      throw new Error("Unknown source type");
    });

    await step.run("save-text", async () => {
      await convex.mutation(api.sources.updateExtractedText, {
        sourceId: sourceId as Id<"sources">,
        extractedText,
        status: "ready",
      });
    });
  },
);
