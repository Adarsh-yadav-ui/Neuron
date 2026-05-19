"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { UploadSource } from "@/components/UploadSource";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  FileText,
  Link,
  Type,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  PanelLeftOpen,
  PanelLeftClose,
  NotebookPen,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { History } from "lucide-react";

type Source = {
  _id: Id<"sources">;
  title: string;
  type: "pdf" | "text" | "url" | "youtube";
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: number;
  url?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
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
    <div className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all hover:bg-muted/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
          <SourceIcon type={source.type} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {source.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fmt(source.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <StatusBadge status={source.status} />
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete source"
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

function SourceSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}

function SourcesList({
  notebookSources,
  isLoading,
  onAddSource,
}: {
  notebookSources: any[];
  isLoading: boolean;
  onAddSource: () => void;
}) {
  return (
    <>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full py-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SourceSkeleton key={i} />)
          ) : notebookSources.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-2xl mb-2">📄</p>
              <p className="text-xs text-muted-foreground">No sources yet.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 text-xs h-7 gap-1"
                onClick={onAddSource}
              >
                <Plus className="h-3 w-3" /> Add source
              </Button>
            </div>
          ) : (
            notebookSources.map((source) => (
              <SourceCard key={source._id} source={source as Source} />
            ))
          )}
        </ScrollArea>
      </div>
      {notebookSources.length > 0 && (
        <div className="px-3 py-3 border-t shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7 gap-1"
            onClick={onAddSource}
          >
            <Plus className="h-3 w-3" /> Add source
          </Button>
        </div>
      )}
    </>
  );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
      aria-label="Copy"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}

const ChatPanel = ({
  notebookId,
  userName,
}: {
  notebookId: string;
  userName: string;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Convex mutation
  const saveMessage = useMutation(api.messages.saveMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // ✅ Save question before clearing input
    const question = input.trim();

    // ✅ User message object
    const userMessage: Message = {
      role: "user",
      content: question,
    };

    // ✅ Add user message to UI
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // ✅ Store complete streamed answer
    let fullAnswer = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          sourceMode,
          notebookId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      if (!res.body) {
        throw new Error("No body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const text = decoder.decode(value);

        // ✅ Collect full streamed answer
        fullAnswer += text;

        // ✅ First chunk
        if (firstChunk) {
          setLoading(false);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: text,
            },
          ]);

          firstChunk = false;
        } else {
          // ✅ Append remaining chunks
          setMessages((prev) => {
            const updated = [...prev];

            const last = updated[updated.length - 1];

            updated[updated.length - 1] = {
              ...last,
              content: last.content + text,
            };

            return updated;
          });
        }
      }

      // ✅ AUTO SAVE TO CONVEX
      if (fullAnswer.trim()) {
        await saveMessage({
          notebookId: notebookId as Id<"notebooks">,
          question,
          content: fullAnswer,
        });
      }
    } catch (error) {

      toast.error("Failed to send message");
    } finally {
      setLoading(false);

      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
        <p className="text-xs text-muted-foreground">
          {sourceMode ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              Source mode
            </span>
          ) : (
            "General mode"
          )}
        </p>

        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setSettingsOpen((p) => !p)}
            aria-label="Chat settings"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>

          {settingsOpen && (
            <div className="absolute right-0 top-9 w-64 bg-popover border border-border rounded-xl shadow-lg p-4 z-20">
              <p className="text-sm font-semibold mb-3">Chat Settings</p>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Source mode</p>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI answers strictly from your uploaded sources only.
                  </p>
                </div>

                <button
                  onClick={() => setSourceMode((p) => !p)}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
                    sourceMode ? "bg-amber-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      sourceMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                className="mt-3 text-xs text-muted-foreground underline w-full text-right"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                  <Image
                    src="/neuron-icon.png"
                    alt="icon"
                    height={26}
                    width={26}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {userName !== "there"
                      ? `Hi ${userName}! Ask me anything`
                      : "Ask Neuron anything"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {sourceMode
                      ? "Answers from your sources."
                      : "Powered by Llama 3.3 via Groq."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {[
                    "Summarize my sources",
                    "What are the key points?",
                    "Explain simply",
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setInput(p);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background text-xs font-semibold shrink-0 mt-0.5">
                      N
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[82%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-foreground text-background rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm">{children}</li>
                            ),
                            code: ({ children, className }) => {
                              const isBlock = className?.includes("language-");
                              return isBlock ? (
                                <div className="relative my-2">
                                  <pre className="bg-background/50 rounded-lg p-3 overflow-x-auto text-xs">
                                    <code>{children}</code>
                                  </pre>
                                  {/* Code block copy button */}
                                  <div className="absolute top-2 right-2">
                                    <CopyButton text={String(children)} />
                                  </div>
                                </div>
                              ) : (
                                <code className="bg-background/50 rounded px-1 py-0.5 text-xs font-mono">
                                  {children}
                                </code>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic my-2">
                                {children}
                              </blockquote>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-base font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-sm font-bold mb-1">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mb-1">
                                {children}
                              </h3>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Full message copy button — below the bubble */}
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} px-1`}
                    >
                      <CopyButton text={msg.content} />
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background text-xs font-semibold shrink-0">
                  N
                </div>

                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t shrink-0">
        <div
          className={`flex gap-2 items-center border rounded-xl px-3 py-2 bg-background transition-colors ${
            sourceMode
              ? "border-amber-500/50 focus-within:border-amber-500"
              : "border-border focus-within:border-foreground/40"
          }`}
        >
          <input
            ref={inputRef}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={
              sourceMode ? "Ask about your sources..." : "Ask anything..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
          />

          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="sm"
            className={`h-7 px-3 ${
              sourceMode ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
            }`}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Neuron can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

const Page = () => {
  const { notebookId } = useParams<{
    notebookId: string;
  }>();

  const router = useRouter();

  const { user } = useUser();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [sourceOpen, setSourceOpen] = useState(false);

  const [panelOpen, setPanelOpen] = useState(true);

  const userName = user?.firstName ?? user?.username ?? "there";

  const notebookSources = useQuery(
    api.sources.getNotebookSources,

    notebookId
      ? {
          notebookId: notebookId as Id<"notebooks">,
        }
      : "skip",
  );

  const notebook = useQuery(
    api.notebooks.getNotebook,

    notebookId
      ? {
          notebookId: notebookId as Id<"notebooks">,
        }
      : "skip",
  );

  // ✅ Saved chat history
  const savedMessages = useQuery(
    api.messages.getMessages,

    notebookId
      ? {
          notebookId: notebookId as Id<"notebooks">,
        }
      : "skip",
  );

  const sources = notebookSources ?? [];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Topbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0 z-10">
        <div className="flex items-center gap-3">
          {/* Mobile sheet */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <PanelLeftOpen className="h-4 w-4" />
              </SheetTrigger>

              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">
                      {sources.length} Sources
                    </SheetTitle>
                  </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                  {sources.map((source) => (
                    <SourceCard key={source._id} source={source as Source} />
                  ))}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setPanelOpen((p) => !p)}
            >
              {panelOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          )}

          <span className="text-sm font-semibold tracking-tight truncate max-w-45 md:max-w-none">
            Neuron{" "}
            <span className="font-normal text-muted-foreground">
              / {notebook?.title ?? "notebook"}
            </span>
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* ✅ History Dialog */}
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                />
              }
            >
              <History className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">History</span>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chat History</DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[70vh] pr-4">
                {!savedMessages || savedMessages.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No saved chats yet.
                  </div>
                ) : (
                  <Accordion className="w-full">
                    {savedMessages.map((msg) => (
                      <AccordionItem key={msg._id} value={msg._id}>
                        <AccordionTrigger className="text-left text-sm">
                          {msg.question}
                        </AccordionTrigger>

                        <AccordionContent>
                          <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed relative">
                            {/* Copy button */}
                            <div className="absolute top-2 right-2">
                              <CopyButton text={msg.answer} />
                            </div>
                            {/* Markdown render */}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-2 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-2 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm">{children}</li>
                                ),
                                code: ({ children, className }) => {
                                  const isBlock =
                                    className?.includes("language-");
                                  return isBlock ? (
                                    <div className="my-2">
                                      <div className="flex items-center justify-between bg-background/30 rounded-t-lg px-3 py-1.5 border-b border-border/30">
                                        <span className="text-xs text-muted-foreground">
                                          Code
                                        </span>
                                        <CopyButton text={String(children)} />
                                      </div>
                                      <pre className="bg-background/50 rounded-b-lg p-3 overflow-x-auto text-xs">
                                        <code>{children}</code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className="bg-background/50 rounded px-1 py-0.5 text-xs font-mono">
                                      {children}
                                    </code>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic my-2">
                                    {children}
                                  </blockquote>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-base font-bold mb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-sm font-bold mb-1">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-semibold mb-1">
                                    {children}
                                  </h3>
                                ),
                              }}
                            >
                              {msg.answer}
                            </ReactMarkdown>
                          </div>
                          {/* Question copy button */}
                          <div className="mt-2 flex justify-end">
                            <CopyButton
                              text={`Q: ${msg.question}\n\nA: ${msg.answer}`}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Notes */}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
            onClick={() =>
              router.push(`/dashboard/notebooks/${notebookId}/notes`)
            }
          >
            <NotebookPen className="h-3.5 w-3.5" />

            <span className="hidden sm:inline">Notes</span>
          </Button>

          {/* Add source */}
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setSourceOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />

            <span className="hidden sm:inline">Add source</span>
          </Button>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sources */}
        {!isMobile && (
          <div
            className={`border-r bg-muted/20 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
              panelOpen ? "w-72" : "w-0"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sources
              </p>

              <span className="text-xs text-muted-foreground">
                {sources.length}
              </span>
            </div>

            <ScrollArea className="flex-1">
              {sources.map((source) => (
                <SourceCard key={source._id} source={source as Source} />
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel notebookId={notebookId} userName={userName} />
        </div>
      </div>

      {/* Upload modal */}
      <UploadSource
        notebookId={notebookId as Id<"notebooks">}
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
      />
    </div>
  );
};

export default Page;
