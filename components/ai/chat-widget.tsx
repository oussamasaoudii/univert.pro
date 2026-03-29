"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  User,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const STARTER_QUESTIONS = [
  {
    id: 1,
    text: "How do I choose the right plan?",
    icon: "🚀",
  },
  {
    id: 2,
    text: "Tell me about template options",
    icon: "🎨",
  },
  {
    id: 3,
    text: "How long does setup take?",
    icon: "⏱️",
  },
  {
    id: 4,
    text: "Can I migrate an existing site?",
    icon: "🔄",
  },
];

const ESCALATION_KEYWORDS = [
  "urgent",
  "critical",
  "broken",
  "not working",
  "error",
  "bug",
  "crash",
  "down",
  "help",
  "assistance",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: "",
    category: "general",
    priority: "normal",
    description: "",
  });
  const [ticketCreated, setTicketCreated] = useState(false);
  const [shouldEscalate, setShouldEscalate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for escalation triggers
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const text = lastMessage.text.toLowerCase();
        const needsEscalation = ESCALATION_KEYWORDS.some((keyword) =>
          text.includes(keyword)
        );
        setShouldEscalate(needsEscalation);
      }
    }
  }, [messages]);

  const sendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      const result = await response.json().catch(() => ({}));
      const reply =
        typeof result?.message === "string" && result.message.trim()
          ? result.message.trim()
          : "I’m here to help with plans, templates, setup, domains, and support. Please try asking your question again.";

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error("Failed to send chat message:", error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          text: "I’m having trouble replying right now. Please try again, or create a support ticket if the issue is urgent.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendChatMessage(input);
    setInput("");
  };

  const handleQuickQuestion = (question: string) => {
    void sendChatMessage(question);
  };

  const handleCreateTicket = async () => {
    if (!ticketData.title.trim() || !ticketData.description.trim()) return;

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketData.title,
          category: ticketData.category,
          priority: ticketData.priority,
          message: ticketData.description,
          source: "chat-widget",
        }),
      });

      if (response.ok) {
        setTicketCreated(true);
        setShowTicketForm(false);
        setTicketData({
          title: "",
          category: "general",
          priority: "normal",
          description: "",
        });
        setTimeout(() => setTicketCreated(false), 5000);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full",
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:scale-105 active:scale-95",
          isOpen && "scale-95"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-slate-900 dark:to-slate-800 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Univert Support
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instant AI assistance available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !showTicketForm ? (
              <div className="h-full flex flex-col justify-between">
                {/* Empty State */}
                <div className="space-y-4">
                  <div className="text-center space-y-2 pt-2">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">
                      Welcome to Univert Support
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get instant answers about plans, setup, features, and more.
                    </p>
                  </div>

                  {/* Starter Questions */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground px-1">
                      Quick topics
                    </p>
                    <div className="space-y-1.5">
                      {STARTER_QUESTIONS.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleQuickQuestion(question.text)}
                          className="w-full text-left px-3 py-2.5 rounded-lg bg-card hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors border border-border hover:border-border/80 text-xs group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>{question.icon}</span>
                              <span className="text-foreground font-medium">
                                {question.text}
                              </span>
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Help Footer */}
                <div className="bg-card/50 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-2">
                  <p>Need urgent help? Click the button below to create a support ticket.</p>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Create Support Ticket
                  </button>
                </div>
              </div>
            ) : null}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5 animate-in fade-in-50 slide-in-from-bottom-2",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-card border border-border/60 text-foreground rounded-bl-none"
                  )}
                >
                  <span className="whitespace-pre-wrap block">{message.text}</span>
                </div>
              </div>
            ))}

            {/* Escalation Panel */}
            {shouldEscalate && messages.length > 0 && !showTicketForm && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 space-y-2 animate-in fade-in-50 slide-in-from-bottom-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-300">
                      It looks like you might need priority support
                    </p>
                    <p className="text-xs text-amber-800/70 dark:text-amber-200/70 mt-1">
                      Create a support ticket for faster resolution
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="w-full px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 animate-in fade-in-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                  <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <div className="bg-card border border-border/60 rounded-xl px-3.5 py-2.5 rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {ticketCreated && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-3 space-y-2 animate-in fade-in-50 slide-in-from-bottom-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-900 dark:text-green-300">
                      Support ticket created successfully
                    </p>
                    <p className="text-xs text-green-800/70 dark:text-green-200/70 mt-1">
                      Our team will get back to you shortly
                    </p>
                  </div>
                </div>
                <a
                  href="/dashboard/support"
                  className="inline-block text-xs font-medium text-green-600 dark:text-green-400 hover:underline"
                >
                  View tickets →
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ticket Form Modal */}
          {showTicketForm && (
            <div className="absolute inset-0 bg-background/95 rounded-2xl backdrop-blur-sm z-10 flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h4 className="font-semibold text-sm">Create Support Ticket</h4>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    value={ticketData.title}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, title: e.target.value })
                    }
                    placeholder="What's the problem?"
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Category
                  </label>
                  <select
                    value={ticketData.category}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="account">Account & Security</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Priority
                  </label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    value={ticketData.description}
                    onChange={(e) =>
                      setTicketData({
                        ...ticketData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Please provide details about your issue..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-4 py-3 border-t border-border flex gap-2 bg-card/50">
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={
                    !ticketData.title.trim() || !ticketData.description.trim()
                  }
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!showTicketForm && messages.length > 0 && (
            <form
              onSubmit={handleSubmit}
              className="border-t border-border p-3.5 flex gap-2 bg-card/50"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
