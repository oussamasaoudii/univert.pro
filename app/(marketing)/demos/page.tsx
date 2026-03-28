"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ExternalLink,
  ArrowRight,
  Star,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

type TemplateCategory =
  | "corporate"
  | "agency"
  | "portfolio"
  | "ecommerce"
  | "restaurant"
  | "saas"
  | "marketplace";
type TemplateStack = "Laravel" | "Next.js" | "WordPress";

type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  stack: TemplateStack;
  liveDemoUrl: string | null;
  startingPrice: number;
  performanceScore: number;
  featured: boolean;
};

function hasTemplates(
  value: { templates?: TemplateRecord[]; error?: string } | { error?: string },
): value is { templates: TemplateRecord[]; error?: string } {
  return Array.isArray((value as { templates?: TemplateRecord[] }).templates);
}

const categories: { value: TemplateCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "corporate", label: "Corporate" },
  { value: "agency", label: "Agency" },
  { value: "portfolio", label: "Portfolio" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "restaurant", label: "Restaurant" },
  { value: "saas", label: "SaaS" },
  { value: "marketplace", label: "Marketplace" },
];

const stacks: { value: TemplateStack | "all"; label: string }[] = [
  { value: "all", label: "All Stacks" },
  { value: "Next.js", label: "Next.js" },
  { value: "Laravel", label: "Laravel" },
  { value: "WordPress", label: "WordPress" },
];

const categoryLabels: Record<TemplateCategory, string> = {
  corporate: "Business website",
  agency: "Agency website",
  portfolio: "Portfolio website",
  ecommerce: "Online store",
  restaurant: "Restaurant website",
  saas: "SaaS website",
  marketplace: "Marketplace website",
};

export default function DemosPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [selectedStack, setSelectedStack] = useState<TemplateStack | "all">("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/templates", { cache: "no-store" });
      const result = (await response.json().catch(() => ({}))) as
        | { templates?: TemplateRecord[]; error?: string }
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_templates");
      }
      setTemplates(hasTemplates(result) ? result.templates : []);
    } catch (error) {
      console.error("[demos] failed to load templates", error);
      setErrorMessage("Failed to load templates from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;
      const matchesStack = selectedStack === "all" || template.stack === selectedStack;

      return matchesSearch && matchesCategory && matchesStack;
    });
  }, [templates, searchQuery, selectedCategory, selectedStack]);

  const featuredTemplates = templates.filter((template) => template.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-gradient-to-b from-accent/5 via-background to-background">
        <div className="container py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-accent/20 text-accent hover:bg-accent/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Template Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Curated Template Gallery
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore launch-ready website concepts with managed setup, hosting, and support
              included. Compare styles, preview the experience, and choose what fits your business.
            </p>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span>{templates.length} Templates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30">
        <div className="container py-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as TemplateCategory | "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedStack}
              onValueChange={(value) => setSelectedStack(value as TemplateStack | "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stacks.map((stack) => (
                  <SelectItem key={stack.value} value={stack.value}>
                    {stack.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16 space-y-10">
        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading templates...
            </CardContent>
          </Card>
        ) : errorMessage ? (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {featuredTemplates.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Featured</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredTemplates.map((template) => (
                    <Card key={template.id} className="bg-card border-border">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-accent/20 text-accent">Featured</Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.stack}</Badge>
                            <Badge variant="secondary">{categoryLabels[template.category]}</Badge>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Includes managed setup, launch support, and a clear path to move later if
                          you outgrow the managed plan.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">${template.startingPrice}/mo</span>
                          <span className="text-sm text-muted-foreground">
                            Score {template.performanceScore}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/demos/${template.id}`} className="flex-1">
                            <Button className="w-full">
                              Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                          {template.liveDemoUrl && (
                            <a href={template.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="icon">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">All Templates</h2>
              {filteredTemplates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No templates match your filters.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="bg-card border-border hover:border-accent/50 transition-colors">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{template.stack}</Badge>
                          <Badge variant="outline">{categoryLabels[template.category]}</Badge>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                            {template.description}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Managed hosting, domain help, and support are included so you can focus
                          on content and growth.
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">${template.startingPrice}/mo</span>
                          <span className="text-muted-foreground">
                            Score {template.performanceScore}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/demos/${template.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          {template.liveDemoUrl && (
                            <a href={template.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
