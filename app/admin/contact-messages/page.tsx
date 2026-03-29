"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Mail, Loader2, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: 'received' | 'in_review' | 'responded';
  created_at: string;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact-messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update message');
      await fetchMessages();
      setSelectedMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    }
  };

  const sendReply = async (messageId: number, reply: string) => {
    if (!reply.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    try {
      setReplySending(true);
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          admin_reply: reply,
          status: 'responded'
        }),
      });
      if (!response.ok) throw new Error('Failed to send reply');
      await fetchMessages();
      setReplyText('');
      setSelectedMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_review': return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'responded': return 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <AlertCircle className="h-4 w-4" />;
      case 'in_review': return <AlertTriangle className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const stats = {
    total: messages.length,
    received: messages.filter(m => m.status === 'received').length,
    inReview: messages.filter(m => m.status === 'in_review').length,
    responded: messages.filter(m => m.status === 'responded').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <Badge variant="outline">Admin</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          View and manage all public contact form submissions from your website visitors.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.received}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No messages yet. When visitors submit the contact form, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="cursor-pointer hover:bg-accent/50 transition" onClick={() => setSelectedMessage(message)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{message.name}</h3>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1">{message.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{message.email}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Type:</span> {message.inquiry_type}
                    </p>
                    <p className="text-sm line-clamp-2">{message.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(message.created_at), 'PPp')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMessage(message);
                  }}>
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedMessage.name}</CardTitle>
                  <CardDescription>{selectedMessage.email}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>✕</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inquiry Type</p>
                <p className="font-semibold">{selectedMessage.inquiry_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">{selectedMessage.message}</p>
              </div>
              
              {/* Admin Reply Section */}
              {selectedMessage.admin_reply ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/50">
                  <p className="text-sm font-medium text-green-900 dark:text-green-400 mb-2">Your Reply</p>
                  <p className="whitespace-pre-wrap text-sm text-green-900 dark:text-green-300">{selectedMessage.admin_reply}</p>
                  {selectedMessage.admin_replied_at && (
                    <p className="text-xs text-green-700 dark:text-green-500 mt-2">
                      Sent: {format(new Date(selectedMessage.admin_replied_at), 'PPp')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Write a Reply (Will be sent from support@example.com)</p>
                  <Textarea
                    placeholder="Type your reply here... This will be sent to the customer via email"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-24"
                  />
                  <Button 
                    onClick={() => sendReply(selectedMessage.id, replyText)}
                    disabled={replySending || !replyText.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {replySending ? 'Sending...' : 'Send Reply & Mark as Responded'}
                  </Button>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex gap-2 mt-2">
                  {['received', 'in_review', 'responded'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedMessage.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateMessageStatus(selectedMessage.id, status)}
                      disabled={replySending}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Received: {format(new Date(selectedMessage.created_at), 'PPp')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
