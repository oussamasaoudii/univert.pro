"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Globe,
  Shield,
  ArrowRight,
} from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "technical" | "billing" | "domain" | "other";

type DashboardTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  responsesCount: number;
};

type SupportResponse = {
  tickets: DashboardTicket[];
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
};

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "outline" }> =
  {
    open: { label: "Open", variant: "default" },
    in_progress: { label: "In Progress", variant: "secondary" },
    resolved: { label: "Resolved", variant: "outline" },
    closed: { label: "Closed", variant: "outline" },
  };

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-600/15 text-red-700 border-red-500/30" },
  high: { label: "High", color: "bg-red-500/10 text-red-700 border-red-500/20" },
  medium: { label: "Medium", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
  low: { label: "Low", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<DashboardTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("technical");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  const loadTickets = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/dashboard/support/tickets", {
        cache: "no-store",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as
        | SupportResponse
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_tickets");
      }

      const payload = result as SupportResponse;
      setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
    } catch (error) {
      console.error("[dashboard/support] failed to load tickets", error);
      setErrorMessage("Failed to load support tickets from MySQL.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const submitTicket = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/dashboard/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          priority,
          description,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as
        | { ticket?: DashboardTicket; error?: string }
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_create_ticket");
      }

      const created = (result as { ticket?: DashboardTicket }).ticket;
      if (created) {
        setTickets((previous) => [created, ...previous]);
      } else {
        await loadTickets();
      }

      setSubject("");
      setCategory("technical");
      setPriority("medium");
      setDescription("");
      setIsCreateOpen(false);
      setSuccessMessage("Support ticket created successfully.");
    } catch (error) {
      console.error("[dashboard/support] failed to create ticket", error);
      setErrorMessage("Failed to create support ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your support requests and get help
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                This ticket will be saved directly in MySQL and visible to admin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  className="mt-1.5"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="domain">Domain Configuration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Provide detailed information about your issue"
                  className="mt-1.5"
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                  onClick={submitTicket}
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen className="w-4 h-4 text-accent" />
              Help Center
            </div>
            <p className="text-sm text-muted-foreground">
              Browse launch, domain, support, and ownership guidance before opening a ticket.
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/help-center">
                Open Help Center
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="w-4 h-4 text-accent" />
              Domain Help
            </div>
            <p className="text-sm text-muted-foreground">
              Need help connecting your domain or understanding DNS status? Start here.
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/domains">
                Manage Domains
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" id="ownership">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="w-4 h-4 text-accent" />
              Ownership &amp; Export
            </div>
            <p className="text-sm text-muted-foreground">
              Your project stays yours. When you are ready to move later, request migration or
              handoff guidance from our team.
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/about/ownership">
                Read Ownership Guide
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading tickets...
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            No tickets yet. Create your first support ticket.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {ticket.ticketNumber}
                      </code>
                      <Badge variant={statusConfig[ticket.status].variant}>
                        {statusConfig[ticket.status].label}
                      </Badge>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded border ${
                          priorityConfig[ticket.priority].color
                        }`}
                      >
                        {priorityConfig[ticket.priority].label} Priority
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket.responsesCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTicket && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Ticket Details
            </CardTitle>
            <CardDescription>{selectedTicket.subject}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Number</p>
                <p className="font-mono text-sm font-semibold">{selectedTicket.ticketNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(selectedTicket.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm font-medium mt-1">{selectedTicket.description}</p>
            </div>
            <Button className="w-full" onClick={() => setSelectedTicketId(null)}>
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-secondary/30 border-border">
        <CardContent className="pt-6 space-y-2">
          <p className="font-semibold">Need launch or migration help?</p>
          <p className="text-sm text-muted-foreground">
            Open a support ticket for setup questions, domain routing, admin access, or future
            export and migration requests. If a capability is still pending, our team will guide
            you to the right next step rather than showing fake completion states.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
