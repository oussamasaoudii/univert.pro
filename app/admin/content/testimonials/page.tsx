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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, GripVertical, AlertCircle, Loader2, RefreshCw, Star, MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  author_name_en: string;
  author_name_ar: string;
  author_role_en: string;
  author_role_ar: string;
  author_avatar?: string;
  quote_en: string;
  quote_ar: string;
  rating: number;
  company?: string;
  display_order: number;
  is_active: boolean;
  page_key: string;
  created_at: string;
  updated_at: string;
}

const pageOptions = [
  { value: "home", label: "Homepage" },
  { value: "auth", label: "Auth Pages" },
  { value: "pricing", label: "Pricing Page" },
  { value: "about", label: "About Page" },
];

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterPage, setFilterPage] = useState<string>("all");

  const [formData, setFormData] = useState({
    author_name_en: "",
    author_name_ar: "",
    author_role_en: "",
    author_role_ar: "",
    author_avatar: "",
    quote_en: "",
    quote_ar: "",
    rating: 5,
    company: "",
    display_order: 0,
    is_active: true,
    page_key: "home",
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/testimonials");
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.data);
      } else {
        setError(data.error || "Failed to fetch testimonials");
      }
    } catch {
      setError("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTestimonial(null);
    setFormData({
      author_name_en: "",
      author_name_ar: "",
      author_role_en: "",
      author_role_ar: "",
      author_avatar: "",
      quote_en: "",
      quote_ar: "",
      rating: 5,
      company: "",
      display_order: testimonials.length,
      is_active: true,
      page_key: "home",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      author_name_en: testimonial.author_name_en,
      author_name_ar: testimonial.author_name_ar,
      author_role_en: testimonial.author_role_en,
      author_role_ar: testimonial.author_role_ar,
      author_avatar: testimonial.author_avatar || "",
      quote_en: testimonial.quote_en,
      quote_ar: testimonial.quote_ar,
      rating: testimonial.rating,
      company: testimonial.company || "",
      display_order: testimonial.display_order,
      is_active: testimonial.is_active,
      page_key: testimonial.page_key,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTestimonial) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/content/testimonials?id=${selectedTestimonial.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchTestimonials();
        setIsDeleteDialogOpen(false);
      } else {
        setError(data.error || "Failed to delete testimonial");
      }
    } catch {
      setError("Failed to delete testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = selectedTestimonial ? "PUT" : "POST";
      const body = selectedTestimonial
        ? { id: selectedTestimonial.id, ...formData }
        : formData;

      const response = await fetch("/api/admin/content/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        fetchTestimonials();
        setIsDialogOpen(false);
      } else {
        setError(data.error || "Failed to save testimonial");
      }
    } catch {
      setError("Failed to save testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTestimonials =
    filterPage === "all"
      ? testimonials
      : testimonials.filter((t) => t.page_key === filterPage);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3 h-3",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials displayed across the website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
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
              <Select value={filterPage} onValueChange={setFilterPage}>
                <SelectTrigger>
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {pageOptions.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredTestimonials.length} testimonial
              {filteredTestimonials.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5" />
            Testimonials
          </CardTitle>
          <CardDescription>
            Customer quotes and reviews displayed on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquareQuote className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No testimonials found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first testimonial
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Quote Preview</TableHead>
                    <TableHead className="w-24">Rating</TableHead>
                    <TableHead className="w-24">Page</TableHead>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {testimonial.author_avatar ? (
                              <AvatarImage src={testimonial.author_avatar} />
                            ) : null}
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                              {testimonial.author_name_en
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {testimonial.author_name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.author_role_en}
                              {testimonial.company && ` at ${testimonial.company}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm text-muted-foreground">
                          &ldquo;{testimonial.quote_en}&rdquo;
                        </p>
                      </TableCell>
                      <TableCell>{renderStars(testimonial.rating)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pageOptions.find((p) => p.value === testimonial.page_key)?.label ||
                            testimonial.page_key}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {testimonial.display_order}
                      </TableCell>
                      <TableCell>
                        <Badge variant={testimonial.is_active ? "default" : "outline"}>
                          {testimonial.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(testimonial)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(testimonial)}
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
              {selectedTestimonial ? "Edit Testimonial" : "Create New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {selectedTestimonial
                ? "Update the testimonial details below"
                : "Add a new customer testimonial"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Author Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name_en">Author Name (English)</Label>
                <Input
                  id="author_name_en"
                  value={formData.author_name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name_en: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_name_ar">Author Name (Arabic)</Label>
                <Input
                  id="author_name_ar"
                  value={formData.author_name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name_ar: e.target.value })
                  }
                  placeholder="جون دو"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Author Role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_role_en">Role (English)</Label>
                <Input
                  id="author_role_en"
                  value={formData.author_role_en}
                  onChange={(e) =>
                    setFormData({ ...formData, author_role_en: e.target.value })
                  }
                  placeholder="CEO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_role_ar">Role (Arabic)</Label>
                <Input
                  id="author_role_ar"
                  value={formData.author_role_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, author_role_ar: e.target.value })
                  }
                  placeholder="المدير التنفيذي"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Company & Avatar */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_avatar">Avatar URL (Optional)</Label>
                <Input
                  id="author_avatar"
                  value={formData.author_avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, author_avatar: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Quote English */}
            <div className="space-y-2">
              <Label htmlFor="quote_en">Quote (English)</Label>
              <Textarea
                id="quote_en"
                value={formData.quote_en}
                onChange={(e) =>
                  setFormData({ ...formData, quote_en: e.target.value })
                }
                placeholder="Enter the testimonial quote in English"
                rows={3}
              />
            </div>

            {/* Quote Arabic */}
            <div className="space-y-2">
              <Label htmlFor="quote_ar">Quote (Arabic)</Label>
              <Textarea
                id="quote_ar"
                value={formData.quote_ar}
                onChange={(e) =>
                  setFormData({ ...formData, quote_ar: e.target.value })
                }
                placeholder="أدخل الاقتباس بالعربية"
                dir="rtl"
                rows={3}
              />
            </div>

            {/* Rating, Page & Order */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={String(formData.rating)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r} Star{r !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="page_key">Display On</Label>
                <Select
                  value={formData.page_key}
                  onValueChange={(value) =>
                    setFormData({ ...formData, page_key: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Order</Label>
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
                  Show this testimonial on the website
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
              {selectedTestimonial ? "Save Changes" : "Create Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be
              undone.
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
