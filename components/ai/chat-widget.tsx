"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
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
  Download,
  Maximize2,
  Clock,
  Home,
  Newspaper,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Agent {
  name: string;
  status: "online" | "away" | "offline";
  avatar?: string;
  department?: string;
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
];

const SUPPORT_AGENT: Agent = {
  name: "Univert Support",
  status: "online",
  department: "Customer Support",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "news" | "tickets">("chat");
  const [input, setInput] = useState("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [shouldEscalate, setShouldEscalate] = useState(false);
  const [expandedWindow, setExpandedWindow] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: "",
    category: "general",
    priority: "normal",
    description: "",
  });
  const [ticketCreated, setTicketCreated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const text = lastMessage.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .toLowerCase();
        const needsEscalation = ESCALATION_KEYWORDS.some((keyword) =>
          text.includes(keyword)
        );
        setShouldEscalate(needsEscalation);
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage({ text: question });
    setActiveTab("chat");
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

  const downloadTranscript = () => {
    const transcript = messages
      .map((msg) => {
        const text = msg.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
        return `${msg.role === "user" ? "You" : "Support"}: ${text}`;
      })
      .join("\n\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(transcript));
    element.setAttribute("download", "chat-transcript.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const chatWindowClass = expandedWindow
    ? "fixed inset-0 z-50 rounded-none"
    : "fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] rounded-2xl";

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full",
          "bg-gradient-to-r from-teal-600 to-teal-700 text-white",
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
        <div
          className={cn(
            "bg-background border border-border shadow-2xl overflow-hidden flex flex-col",
            "h-[600px] max-h-[85vh]",
            chatWindowClass
          )}
        >
          {/* Header with Agent Info */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Agent Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold border-2 border-teal-300/30">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white truncate">
                      {SUPPORT_AGENT.name}
                    </h3>
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        SUPPORT_AGENT.status === "online"
                          ? "bg-green-400"
                          : SUPPORT_AGENT.status === "away"
                            ? "bg-yellow-400"
                            : "bg-gray-400"
                      )}
                    />
                  </div>
                  <p className="text-xs text-slate-300">
                    {SUPPORT_AGENT.status === "online"
                      ? "Active now"
                      : SUPPORT_AGENT.status === "away"
                        ? "Away"
                        : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Download transcript"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpandedWindow(!expandedWindow)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Expand window"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          {!showTicketForm && (
            <div className="flex border-b border-border bg-card/50">
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  activeTab === "chat"
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5 inline-block mr-1" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={cn(
                  "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  activeTab === "news"
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Newspaper className="h-3.5 w-3.5 inline-block mr-1" />
                News
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={cn(
                  "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  activeTab === "tickets"
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Ticket className="h-3.5 w-3.5 inline-block mr-1" />
                Tickets
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === "chat" && (
              <>
                {/* Empty State */}
                {messages.length === 0 && !showTicketForm && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="text-center space-y-2 pt-2">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm">
                          Hi there! How can we help?
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Ask us anything about plans, setup, features, and more.
                        </p>
                      </div>

                      {/* Starter Questions */}
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-medium text-muted-foreground px-1">
                          Popular questions
                        </p>
                        <div className="space-y-1.5">
                          {STARTER_QUESTIONS.map((question) => (
                            <button
                              key={question.id}
                              onClick={() => handleQuickQuestion(question.text)}
                              className="w-full text-left px-3 py-2.5 rounded-lg bg-card hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors border border-border hover:border-teal-400/50 group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <span>{question.icon}</span>
                                  <span className="text-foreground font-medium text-xs">
                                    {question.text}
                                  </span>
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Help Footer */}
                    <div className="bg-card/50 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-2">
                      <p>Need to create a support ticket?</p>
                      <button
                        onClick={() => setShowTicketForm(true)}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-medium transition-colors"
                      >
                        Create Support Ticket
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2.5 animate-in fade-in-50 slide-in-from-bottom-2",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                        message.role === "user"
                          ? "bg-teal-600 text-white"
                          : "bg-slate-700 text-slate-200"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-slate-700 text-slate-100 rounded-bl-none"
                      )}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <span key={index} className="whitespace-pre-wrap block">
                              {part.text}
                            </span>
                          );
                        }
                        return null;
                      })}
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
                          Priority support available
                        </p>
                        <p className="text-xs text-amber-800/70 dark:text-amber-200/70 mt-1">
                          Create a ticket for faster resolution
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-700">
                      <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />
                    </div>
                    <div className="bg-slate-700 rounded-xl px-3.5 py-2.5 rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400/40 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-slate-400/40 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                          Ticket created successfully
                        </p>
                        <p className="text-xs text-green-800/70 dark:text-green-200/70 mt-1">
                          Check your email for confirmation
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}

            {activeTab === "news" && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg p-4 text-slate-900">
                  <h4 className="font-semibold text-sm mb-1">Latest Updates</h4>
                  <p className="text-xs">Check our announcements and feature updates</p>
                </div>
                <div className="text-center text-muted-foreground text-xs py-8">
                  No news items yet. Check back soon!
                </div>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="space-y-3">
                <div className="text-center text-muted-foreground text-xs py-8">
                  <Ticket className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No active tickets</p>
                </div>
              </div>
            )}
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Issue Title</label>
                  <input
                    type="text"
                    value={ticketData.title}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, title: e.target.value })
                    }
                    placeholder="What's the problem?"
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="feature-request">Feature Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Priority</label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Description</label>
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
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                  />
                </div>
              </div>

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
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          {!showTicketForm && activeTab === "chat" && messages.length > 0 && (
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
                className="flex-1 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
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
