"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ShieldAlert,
  Send,
  User,
  Shield,
} from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "technical" | "billing" | "domain" | "other";

type AdminTicket = {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  responsesCount: number;
  createdAt: string;
  updatedAt: string;
};

type TicketStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriorityOpen: number;
};

type TicketMessage = {
  id: string;
  ticketId: string;
  senderUserId: string | null;
  senderRole: "user" | "admin" | "system";
  message: string;
  createdAt: string;
};

type TicketsResponse = {
  tickets: AdminTicket[];
  stats: TicketStats;
};

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    variant: "secondary" | "default" | "outline" | "destructive";
    icon: typeof AlertCircle;
    color: string;
  }
> = {
  open: { label: "Open", variant: "secondary", icon: AlertCircle, color: "text-yellow-500" },
  in_progress: { label: "In Progress", variant: "default", icon: Clock, color: "text-blue-500" },
  resolved: { label: "Resolved", variant: "outline", icon: CheckCircle2, color: "text-green-500" },
  closed: { label: "Closed", variant: "outline", icon: XCircle, color: "text-muted-foreground" },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; variant: "outline" | "secondary" | "destructive" }
> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "destructive" },
  urgent: { label: "Urgent", variant: "destructive" },
};

const defaultStats: TicketStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  highPriorityOpen: 0,
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadTickets = async (filters?: {
    search?: string;
    status?: string;
    priority?: string;
  }) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams();
      if (filters?.search && filters.search.trim()) {
        params.set("search", filters.search.trim());
      }
      if (filters?.status && filters.status !== "all") {
        params.set("status", filters.status);
      }
      if (filters?.priority && filters.priority !== "all") {
        params.set("priority", filters.priority);
      }

      const query = params.toString();
      const response = await fetch(`/api/admin/tickets${query ? `?${query}` : ""}`, {
        cache: "no-store",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as
        | TicketsResponse
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_tickets");
      }

      const payload = result as TicketsResponse;
      setTickets(Array.isArray(payload.tickets) ? payload.tickets : []);
      setStats(payload.stats || defaultStats);
    } catch (error) {
      console.error("[admin/tickets] failed to load tickets", error);
      setErrorMessage("Failed to load support tickets from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId],
  );

  const loadTicketDetails = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && result.messages) {
        setTicketMessages(result.messages);
      }
    } catch (error) {
      console.error("[admin/tickets] failed to load ticket details", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setTicketMessages([]);
    setReplyText("");
    loadTicketDetails(ticketId);
  };

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyText.trim()) return;
    
    setSendingReply(true);
    setErrorMessage("");
    
    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
        credentials: "include",
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "failed_to_send_reply");
      }
      
      setReplyText("");
      setSuccessMessage("Reply sent successfully");
      
      if (result.messages) {
        setTicketMessages(result.messages);
      }
      
      loadTickets({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      });
    } catch (error) {
      console.error("[admin/tickets] failed to send reply", error);
      setErrorMessage("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const updateTicket = async (
    ticketId: string,
    payload: Partial<{
      status: TicketStatus;
      priority: TicketPriority;
      category: TicketCategory;
    }>,
    successText: string,
  ) => {
    setUpdatingTicketId(ticketId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as
        | { ticket?: AdminTicket; error?: string }
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_update_ticket");
      }

      const updated = (result as { ticket?: AdminTicket }).ticket;
      if (updated) {
        setTickets((previous) => previous.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
      }

      setSuccessMessage(successText);
      loadTickets({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
      });
    } catch (error) {
      console.error("[admin/tickets] failed to update ticket", error);
      setErrorMessage("Failed to update ticket.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to customer support requests</p>
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

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Being handled</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityOpen}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[170px] bg-secondary border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[170px] bg-secondary border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Ticket</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => {
                    const status = statusConfig[ticket.status];
                    const priority = priorityConfig[ticket.priority];
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={ticket.id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground uppercase font-mono">
                              {ticket.ticketNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-accent">
                                {(ticket.userName || ticket.userEmail || "U")
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">
                              {ticket.userName || ticket.userEmail || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priority.variant} className="capitalize">
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`w-3 h-3 ${status.color}`} />
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={updatingTicketId === ticket.id}>
                                {updatingTicketId === ticket.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-4 h-4" />
                                )}
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSelectTicket(ticket.id)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { status: "in_progress" }, "Ticket marked as in progress")
                                }
                              >
                                Mark In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { status: "resolved" }, "Ticket marked as resolved")
                                }
                              >
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { status: "closed" }, "Ticket closed successfully")
                                }
                              >
                                Close Ticket
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { priority: "high" }, "Priority updated to high")
                                }
                              >
                                Set High Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { priority: "medium" }, "Priority updated to medium")
                                }
                              >
                                Set Medium Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateTicket(ticket.id, { priority: "low" }, "Priority updated to low")
                                }
                              >
                                Set Low Priority
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedTicket && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ticket Number</p>
                <p className="font-mono">{selectedTicket.ticketNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User</p>
                <p>{selectedTicket.userName || selectedTicket.userEmail || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>
                  {new Date(selectedTicket.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Responses</p>
                <p>{selectedTicket.responsesCount}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm mb-1">Subject</p>
              <p className="font-medium">{selectedTicket.subject}</p>
            </div>
            {/* Messages Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation
              </h4>
              
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading messages...
                </div>
              ) : ticketMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No messages yet</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {ticketMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderRole === "admin"
                          ? "bg-primary/10 border border-primary/20 ml-8"
                          : msg.senderRole === "system"
                          ? "bg-muted/50 border border-border mx-4 text-center"
                          : "bg-secondary border border-border mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.senderRole === "admin" ? (
                          <Shield className="w-3 h-3 text-primary" />
                        ) : msg.senderRole === "user" ? (
                          <User className="w-3 h-3 text-muted-foreground" />
                        ) : null}
                        <span className="text-xs font-medium capitalize">
                          {msg.senderRole === "admin" ? "Support Team" : msg.senderRole}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Send Reply</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="bg-secondary border-border resize-none"
                  disabled={sendingReply}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="gap-2"
                  >
                    {sendingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTicketId(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
