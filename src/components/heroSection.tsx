"use client";

import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "./ui/animated-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  MessageSquare,
  Zap,
  ShieldCheck,
  Brain,
  FileText,
  StickyNote,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

const features = [
  {
    icon: Brain,
    title: "RAG-powered Q&A",
    description:
      "Ask any question about your book and get precise, grounded answers backed by the actual text — not hallucinations.",
    badge: "Core",
  },
  {
    icon: Upload,
    title: "PDF ingestion",
    description:
      "Upload any PDF and Neuron automatically extracts, chunks, and indexes it for instant semantic search.",
    badge: null,
  },
  {
    icon: Zap,
    title: "Instant answers",
    description:
      "Gemini 1.5 Pro streams responses in real time. Ask follow-ups, dig deeper, and explore ideas at the speed of thought.",
    badge: "Fast",
  },
  {
    icon: StickyNote,
    title: "Notion-style notes",
    description:
      "A full block editor lives alongside every book. Capture insights, write summaries, and build your own knowledge base.",
    badge: null,
  },
  {
    icon: FileText,
    title: "Source citations",
    description:
      "Every answer links back to the exact passages it came from. Never wonder where an insight came from again.",
    badge: null,
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Your notebooks, notes, and conversations are yours alone. No sharing, no training on your data.",
    badge: null,
  },
];

const useCases = [
  {
    icon: BookOpen,
    title: "Deep reading",
    description:
      "Stop passively reading. Chat with your notebooks, surface connections, and retain what actually matters.",
  },
  {
    icon: MessageSquare,
    title: "Research & study",
    description:
      "Upload textbooks, papers, or reports. Ask questions, take notes, and build understanding — not just summaries.",
  },
  {
    icon: Sparkles,
    title: "Knowledge building",
    description:
      "Every book becomes a thinking partner. Your notes and conversations compound into a personal knowledge graph.",
  },
];

const stats = [
  { value: "2M", label: "Token context window" },
  { value: "<1s", label: "Answer latency" },
  { value: "100%", label: "Source-grounded" },
  { value: "∞", label: "Notebooks supported" },
];

export function HeroSection() {
  return (
    <main className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="dot-grid-fade relative">
        {/* Teal glow blob — top left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 size-125 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #1D9E75, transparent 70%)",
          }}
        />

        {/* Purple glow blob — top right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-32 size-100 rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, #7F77DD, transparent 70%)",
          }}
        />

        <div className="relative pt-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="sm:mx-auto lg:mr-auto">
              <AnimatedGroup
                //@ts-ignore
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <Badge
                  className="mb-4 gap-1.5"
                  style={{ background: "#1D9E75", color: "#fff" }}
                >
                  <Sparkles className="size-3" />
                  Powered by Gemini 1.5 Pro
                </Badge>

                <h1 className="mt-4 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-6">
                  Your notebooks,{" "}
                  <span
                    style={{
                      background: "linear-gradient(90deg, #1D9E75, #7F77DD)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    made intelligent
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
                  Upload any book. Ask anything. Neuron uses RAG to give you
                  precise, source-grounded answers — with a full block editor
                  for notes alongside every book.
                </p>

                <div className="mt-10 flex items-center gap-2">
                  <Unauthenticated>
                    <div className="rounded-[14px] border p-0.5" style={{ background: "rgba(29,158,117,0.1)", borderColor: "#1D9E75" }}>
                      <SignInButton>
                        <Button size="lg" className="rounded-xl px-5 text-base" style={{ background: "#1D9E75", color: "#fff" }}>
                          <span className="text-nowrap">Start reading</span>
                        </Button>
                      </SignInButton>
                    </div>
                    <SignUpButton>
                      <Button size="lg" variant="ghost" className="h-10.5 rounded-xl px-5 text-base">
                        <span className="text-nowrap">See how it works</span>
                      </Button>
                    </SignUpButton>
                  </Unauthenticated>
                  <Authenticated>
                    <Link href="/dashboard">
                      <Button size="lg" className="rounded-xl px-5 text-base" style={{ background: "#1D9E75", color: "#fff" }}>
                        Go to dashboard
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </Authenticated>
                  <div
                    className="rounded-[14px] border p-0.5"
                    style={{
                      background: "rgba(29,158,117,0.1)",
                      borderColor: "#1D9E75",
                    }}
                  >
                    <Button
                      size="lg"
                      className="rounded-xl px-5 text-base"
                      style={{
                        background: "#1D9E75",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(29,158,117,0.4)",
                      }}
                    >
                      <span className="text-nowrap">Start reading</span>
                    </Button>
                  </div>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5 text-base"
                  >
                    <span className="text-nowrap">See how it works</span>
                  </Button>
                </div>
              </AnimatedGroup>
            </div>
          </div>

          <AnimatedGroup
            //@ts-ignore
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
              {/* Teal glow under the screenshot */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-32 w-3/4 -z-10 blur-3xl opacity-30"
                style={{
                  background: "linear-gradient(90deg, #1D9E75, #7F77DD)",
                }}
              />
              <div
                className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl p-4 ring-1 border-2 border-border"
                style={{
                  boxShadow:
                    "0 0 40px rgba(29,158,117,0.12), 0 0 80px rgba(127,119,221,0.08)",
                }}
              >
                <img
                  className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                  src="https://placehold.co/2700x1440/0f1117/1D9E75?text=Neuron"
                  alt="Neuron app interface"
                  width="2700"
                  height="1440"
                />
                <img
                  className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                  src="https://placehold.co/2700x1440/f0faf6/1D9E75?text=Neuron"
                  alt="Neuron app interface"
                  width="2700"
                  height="1440"
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-4xl font-semibold tracking-tight"
                style={{ color: "#1D9E75" }}
              >
                {s.value}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-5xl px-6" />

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12">
          <Badge
            className="mb-4"
            style={{ background: "#7F77DD", color: "#fff" }}
          >
            Features
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Everything you need to read deeply
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base">
            From semantic search to block-based notes, Neuron gives you the full
            stack to actually understand what you read.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden transition-all duration-200 hover:shadow-md"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1D9E75";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(29,158,117,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ background: "rgba(29,158,117,0.1)" }}
                  >
                    <f.icon className="size-5" style={{ color: "#1D9E75" }} />
                  </div>
                  {f.badge && (
                    <Badge
                      className="text-xs"
                      style={{ background: "#1D9E75", color: "#fff" }}
                    >
                      {f.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {f.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-5xl px-6" />

      {/* ── Use Cases ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12">
          <Badge
            className="mb-4"
            style={{ background: "#1D9E75", color: "#fff" }}
          >
            Use Cases
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Built for curious minds
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base">
            Whether you're a student, researcher, or just a voracious reader —
            Neuron turns passive reading into active understanding.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {useCases.map((u) => (
            <Card
              key={u.title}
              className="border-border/60 bg-muted/30 flex flex-col gap-4 p-6"
            >
              <div
                className="flex size-10 items-center justify-center rounded-lg border shadow-sm"
                style={{
                  background: "rgba(127,119,221,0.08)",
                  borderColor: "rgba(127,119,221,0.3)",
                }}
              >
                <u.icon className="size-5" style={{ color: "#7F77DD" }} />
              </div>
              <div>
                <h3 className="font-medium">{u.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {u.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card
          className="overflow-hidden p-10"
          style={{
            background: "#3C3489",
            boxShadow:
              "0 0 60px rgba(29,158,117,0.2), 0 0 40px rgba(127,119,221,0.15)",
            border: "none",
          }}
        >
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Read once. Know forever.
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/70">
                Upload your first book and start asking questions in under a
                minute. No setup, no configuration — just understanding.
              </p>
            </div>
            <Unauthenticated>
              <SignUpButton>
                <Button size="lg" variant="outline" className="shrink-0 rounded-xl px-6 text-white border-white/30 hover:bg-white/10">
                  Get started free
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>
            </Unauthenticated>
            <Authenticated>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="shrink-0 rounded-xl px-6 text-white border-white/30 hover:bg-white/10">
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </Authenticated>
          </div>
        </Card>
      </section>
    </main>
  );
}
