'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Star,
  FileCode,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type TemplateRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'corporate' | 'agency' | 'portfolio' | 'ecommerce' | 'restaurant' | 'saas' | 'marketplace';
  stack: 'Laravel' | 'Next.js' | 'WordPress';
  previewImageUrl: string | null;
  liveDemoUrl: string | null;
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
};

type TemplateFormState = {
  name: string;
  description: string;
  category: TemplateRecord['category'];
  stack: TemplateRecord['stack'];
  startingPrice: string;
  performanceScore: string;
  featured: boolean;
  isActive: boolean;
  liveDemoUrl: string;
  previewImageUrl: string;
};

const INITIAL_FORM: TemplateFormState = {
  name: '',
  description: '',
  category: 'corporate',
  stack: 'Next.js',
  startingPrice: '39',
  performanceScore: '4.5',
  featured: false,
  isActive: true,
  liveDemoUrl: '',
  previewImageUrl: '',
};

export default function AdminTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadTemplates = async (search = '') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const query = new URLSearchParams();
      query.set('includeInactive', 'true');
      if (search.trim()) {
        query.set('search', search.trim());
      }

      const response = await fetch(`/api/admin/templates?${query.toString()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_load_templates'));
      }
      setTemplates(Array.isArray(result?.templates) ? result.templates : []);
    } catch (error) {
      console.error('[admin/templates] load failed', error);
      setErrorMessage('Failed to load templates from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplates(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return templates;

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.stack.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, templates]);

  const createTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        stack: form.stack,
        startingPrice: Number(form.startingPrice),
        performanceScore: Number(form.performanceScore),
        featured: form.featured,
        isActive: form.isActive,
        liveDemoUrl: form.liveDemoUrl || null,
        previewImageUrl: form.previewImageUrl || null,
      };

      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_create_template'));
      }

      const template = result?.template as TemplateRecord | undefined;
      if (template) {
        setTemplates((previous) => [template, ...previous]);
      } else {
        await loadTemplates(searchQuery);
      }

      setForm(INITIAL_FORM);
      setIsAddDialogOpen(false);
      setSuccessMessage('Template created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create template.');
    } finally {
      setSaving(false);
    }
  };

  const patchTemplate = async (
    templateId: string,
    payload: Record<string, unknown>,
    successText: string,
  ) => {
    setWorkingId(templateId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_update_template'));
      }

      const updated = result?.template as TemplateRecord | undefined;
      if (updated) {
        setTemplates((previous) =>
          previous.map((template) => (template.id === updated.id ? updated : template)),
        );
      } else {
        await loadTemplates(searchQuery);
      }

      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update template.');
    } finally {
      setWorkingId(null);
    }
  };

  const removeTemplate = async (templateId: string) => {
    setWorkingId(templateId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(result?.error || 'failed_to_delete_template'));
      }

      setTemplates((previous) => previous.filter((template) => template.id !== templateId));
      setSuccessMessage('Template deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete template.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground">Templates are now stored and controlled from MySQL.</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setForm(INITIAL_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
              <DialogDescription>
                This template will be saved into MySQL and shown in admin/templates.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createTemplate} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        category: value as TemplateFormState['category'],
                      }))
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">corporate</SelectItem>
                      <SelectItem value="agency">agency</SelectItem>
                      <SelectItem value="portfolio">portfolio</SelectItem>
                      <SelectItem value="ecommerce">ecommerce</SelectItem>
                      <SelectItem value="restaurant">restaurant</SelectItem>
                      <SelectItem value="saas">saas</SelectItem>
                      <SelectItem value="marketplace">marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, description: event.target.value }))
                  }
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                  <Select
                    value={form.stack}
                    onValueChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        stack: value as TemplateFormState['stack'],
                      }))
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Next.js">Next.js</SelectItem>
                      <SelectItem value="Laravel">Laravel</SelectItem>
                      <SelectItem value="WordPress">WordPress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-price">Starting Price ($/mo)</Label>
                  <Input
                    id="template-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.startingPrice}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, startingPrice: event.target.value }))
                    }
                    className="bg-secondary border-border"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-score">Performance Score (0-5)</Label>
                  <Input
                    id="template-score"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.performanceScore}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, performanceScore: event.target.value }))
                    }
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-demo-url">Live Demo URL</Label>
                  <Input
                    id="template-demo-url"
                    placeholder="https://demo.example.com"
                    value={form.liveDemoUrl}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, liveDemoUrl: event.target.value }))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-image-url">Preview Image URL (optional)</Label>
                <Input
                  id="template-image-url"
                  value={form.previewImageUrl}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, previewImageUrl: event.target.value }))
                  }
                  className="bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      setForm((previous) => ({ ...previous, featured: checked }))
                    }
                  />
                  <Label htmlFor="featured">Featured Template</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((previous) => ({ ...previous, isActive: checked }))
                    }
                  />
                  <Label htmlFor="active">Active Template</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Template'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((template) => template.featured).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((template) => template.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next.js</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((template) => template.stack === 'Next.js').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stack</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No templates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
                            <FileCode className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.stack}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${template.startingPrice}/mo</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm">{template.performanceScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {template.featured && (
                            <Badge className="bg-accent/10 text-accent hover:bg-accent/20">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={workingId === template.id}>
                              {workingId === template.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="w-4 h-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {template.liveDemoUrl && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={template.liveDemoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Demo
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                patchTemplate(
                                  template.id,
                                  { featured: !template.featured },
                                  template.featured
                                    ? 'Template removed from featured.'
                                    : 'Template marked as featured.',
                                )
                              }
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {template.featured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                patchTemplate(
                                  template.id,
                                  { isActive: !template.isActive },
                                  template.isActive
                                    ? 'Template deactivated.'
                                    : 'Template activated.',
                                )
                              }
                            >
                              {template.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => removeTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
