"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, GripVertical, AlertCircle, Loader2, RefreshCw, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing & Pricing" },
  { value: "technical", label: "Technical" },
  { value: "support", label: "Support" },
  { value: "features", label: "Features" },
];

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    question_en: "",
    question_ar: "",
    answer_en: "",
    answer_ar: "",
    category: "general",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/faqs");
      const data = await response.json();
      if (data.success) {
        setFaqs(data.data);
      } else {
        setError(data.error || "Failed to fetch FAQs");
      }
    } catch {
      setError("Failed to fetch FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFaq(null);
    setFormData({
      question_en: "",
      question_ar: "",
      answer_en: "",
      answer_ar: "",
      category: "general",
      display_order: faqs.length,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setFormData({
      question_en: faq.question_en,
      question_ar: faq.question_ar,
      answer_en: faq.answer_en,
      answer_ar: faq.answer_ar,
      category: faq.category,
      display_order: faq.display_order,
      is_active: faq.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFaq) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/content/faqs?id=${selectedFaq.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchFaqs();
        setIsDeleteDialogOpen(false);
      } else {
        setError(data.error || "Failed to delete FAQ");
      }
    } catch {
      setError("Failed to delete FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = selectedFaq ? "PUT" : "POST";
      const body = selectedFaq ? { id: selectedFaq.id, ...formData } : formData;

      const response = await fetch("/api/admin/content/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        fetchFaqs();
        setIsDialogOpen(false);
      } else {
        setError(data.error || "Failed to save FAQ");
      }
    } catch {
      setError("Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFaqs = filterCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAQs Management</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions displayed on the website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredFaqs.length} FAQ{filteredFaqs.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            FAQs
          </CardTitle>
          <CardDescription>
            Questions and answers displayed in the FAQ section
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No FAQs found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first FAQ
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Question (EN)</TableHead>
                    <TableHead>Question (AR)</TableHead>
                    <TableHead className="w-32">Category</TableHead>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {faq.question_en}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-right" dir="rtl">
                        {faq.question_ar}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categories.find(c => c.value === faq.category)?.label || faq.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{faq.display_order}</TableCell>
                      <TableCell>
                        <Badge variant={faq.is_active ? "default" : "outline"}>
                          {faq.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(faq)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(faq)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFaq ? "Edit FAQ" : "Create New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {selectedFaq
                ? "Update the FAQ details below"
                : "Add a new frequently asked question"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* English Question */}
            <div className="space-y-2">
              <Label htmlFor="question_en">Question (English)</Label>
              <Input
                id="question_en"
                value={formData.question_en}
                onChange={(e) =>
                  setFormData({ ...formData, question_en: e.target.value })
                }
                placeholder="Enter the question in English"
              />
            </div>

            {/* Arabic Question */}
            <div className="space-y-2">
              <Label htmlFor="question_ar">Question (Arabic)</Label>
              <Input
                id="question_ar"
                value={formData.question_ar}
                onChange={(e) =>
                  setFormData({ ...formData, question_ar: e.target.value })
                }
                placeholder="أدخل السؤال بالعربية"
                dir="rtl"
              />
            </div>

            {/* English Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer_en">Answer (English)</Label>
              <Textarea
                id="answer_en"
                value={formData.answer_en}
                onChange={(e) =>
                  setFormData({ ...formData, answer_en: e.target.value })
                }
                placeholder="Enter the answer in English"
                rows={4}
              />
            </div>

            {/* Arabic Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer_ar">Answer (Arabic)</Label>
              <Textarea
                id="answer_ar"
                value={formData.answer_ar}
                onChange={(e) =>
                  setFormData({ ...formData, answer_ar: e.target.value })
                }
                placeholder="أدخل الإجابة بالعربية"
                dir="rtl"
                rows={4}
              />
            </div>

            {/* Category & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Show this FAQ on the website
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedFaq ? "Save Changes" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
