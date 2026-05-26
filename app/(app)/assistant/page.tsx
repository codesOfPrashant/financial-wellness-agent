import { ChatWindow } from "@/components/chat/chat-window";

export default function AssistantPage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="text-sm text-slate-500">
          Ask questions about your salary, deductions, and declarations
        </p>
      </div>
      <ChatWindow className="min-h-0 flex-1" />
    </div>
  );
}
