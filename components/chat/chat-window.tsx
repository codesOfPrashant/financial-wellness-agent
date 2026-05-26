"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, BookOpen } from "lucide-react";
import type { AiAskResponse } from "@/types";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  meta?: AiAskResponse;
}

const SUGGESTIONS = [
  "Why is my salary lower this month?",
  "How much HRA did I receive?",
  "What deductions were applied?",
  "What is PF?",
  "How much tax was deducted?",
  "What reimbursements are included?",
];

interface ChatWindowProps {
  className?: string;
}

export function ChatWindow({ className }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your payroll assistant. Ask me about your payslip, deductions, or tax declarations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data: AiAskResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.answer,
          meta: data,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            e instanceof Error
              ? e.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      className={cn(
        "flex h-[min(720px,calc(100vh-11rem))] flex-col overflow-hidden",
        className
      )}
    >
      <CardHeader className="shrink-0 border-b py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-emerald-600" />
          Payroll AI Assistant
        </CardTitle>
        <p className="text-xs text-slate-500">
          Answers use your payroll records only
        </p>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="shrink-0 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border bg-white px-3 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-800"
            >
              {s}
            </button>
          ))}
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2"
          aria-label="Chat messages"
          role="log"
        >
          <div className="space-y-4 pb-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Bot className="h-4 w-4 text-emerald-700" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.meta?.sources && msg.meta.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-200 pt-2">
                      <BookOpen className="h-3 w-3 text-slate-500" />
                      {msg.meta.sources.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing your payroll records…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form
          className="flex shrink-0 gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your payslip…"
            rows={2}
            className="resize-none"
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
