import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processSource } from "@/inngest/functions/processSource";

export const runtime = "nodejs"; // ✅ add kar

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processSource],
});
