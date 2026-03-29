'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, MessageSquare, AlertTriangle, Mail } from 'lucide-react';

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: 'received' | 'in_review' | 'responded';
  created_at: string;
  notes?: string | null;
};

type MessageStatus = 'received' | 'in_review' | 'responded';

const statusConfig: Record<MessageStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; color: string }> = {
  received: { label: 'Received', variant: 'default', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  in_review: { label: 'In Review', variant: 'secondary', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
  responded: { label: 'Responded', variant: 'outline', color: 'bg-green-500/10 text-green-700 border-green-500/20' },
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MessageStatus>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState<MessageStatus>('received');

  const selectedMessage = messages.find((msg) => msg.id === selectedMessageId);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const loadMessages = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/dashboard/contact-messages', {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (error) {
      console.error('[dashboard/contact-messages] failed to load messages', error);
      setErrorMessage('Contact messages are temporarily unavailable in this preview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateMessage = async () => {
    if (!selectedMessage) return;

    setIsUpdating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/dashboard/contact-messages/${selectedMessage.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const data = await response.json();
      setMessages((prev) =>
        prev.map((msg) => (msg.id === selectedMessage.id ? data.message : msg))
      );

      setSuccessMessage('Message updated successfully.');
      setUpdateNotes('');
      setUpdateStatus('received');
      setTimeout(() => {
        setSelectedMessageId(null);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('[dashboard/contact-messages] failed to update message', error);
      setErrorMessage('Failed to update message.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Messages submitted from the public contact form
        </p>
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {messages.filter((m) => m.status === 'received').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">New Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {messages.filter((m) => m.status === 'responded').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Responded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | MessageStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading messages...
          </CardContent>
        </Card>
      ) : filteredMessages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Mail className="w-8 h-8 opacity-50" />
            {messages.length === 0 ? 'No contact messages yet.' : 'No messages match your filters.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className="hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedMessageId(message.id);
                setUpdateStatus(message.status);
                setUpdateNotes(message.notes || '');
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge variant={statusConfig[message.status].variant}>
                        {statusConfig[message.status].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{message.inquiry_type}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{message.name}</h3>
                    <p className="text-sm text-muted-foreground">{message.email}</p>
                    <p className="text-sm text-foreground mt-2 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(message.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessageId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
              <DialogDescription>Manage and update this contact message</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Inquiry Type</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMessage.inquiry_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Received</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedMessage.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <div className="bg-muted rounded p-3 mt-1 text-sm text-foreground whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div>
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Status
                </label>
                <Select value={updateStatus} onValueChange={(value) => setUpdateStatus(value as MessageStatus)}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Internal Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes about this message..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedMessageId(null)}>
                  Cancel
                </Button>
                <Button disabled={isUpdating} onClick={updateMessage}>
                  {isUpdating ? 'Updating...' : 'Update Message'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
