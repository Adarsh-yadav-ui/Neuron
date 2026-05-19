import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "neuron",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
