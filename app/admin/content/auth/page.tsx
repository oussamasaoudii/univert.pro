"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, Save, RefreshCw, LogIn, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageSection {
  id: string;
  page_key: string;
  section_key: string;
  title_en: string;
  title_ar: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  content_en?: string;
  content_ar?: string;
  metadata?: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
}

const authSections = [
  {
    key: "login_hero",
    name: "Login Page - Hero",
    description: "Main headline on the login page left panel",
    fields: ["title", "subtitle"],
  },
  {
    key: "login_benefits",
    name: "Login Page - Benefits",
    description: "Key benefits shown on login page",
    fields: ["title", "content"],
  },
  {
    key: "signup_hero",
    name: "Signup Page - Hero",
    description: "Main headline on the signup page left panel",
    fields: ["title", "subtitle"],
  },
  {
    key: "signup_benefits",
    name: "Signup Page - Benefits",
    description: "Key benefits shown on signup page",
    fields: ["title", "content"],
  },
  {
    key: "forgot_password",
    name: "Forgot Password Page",
    description: "Content for password reset page",
    fields: ["title", "subtitle"],
  },
  {
    key: "verify_email",
    name: "Email Verification Page",
    description: "Content for email verification page",
    fields: ["title", "subtitle"],
  },
];

export default function AuthContentPage() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"en" | "ar">("en");

  const [formData, setFormData] = useState<Record<string, {
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    content_en: string;
    content_ar: string;
    is_active: boolean;
  }>>({});

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content/sections?page_key=auth");
      const data = await response.json();
      if (data.success) {
        setSections(data.data);
        
        const initialFormData: typeof formData = {};
        authSections.forEach((section) => {
          const existing = data.data.find((s: PageSection) => s.section_key === section.key);
          initialFormData[section.key] = {
            title_en: existing?.title_en || "",
            title_ar: existing?.title_ar || "",
            subtitle_en: existing?.subtitle_en || "",
            subtitle_ar: existing?.subtitle_ar || "",
            content_en: existing?.content_en || "",
            content_ar: existing?.content_ar || "",
            is_active: existing?.is_active ?? true,
          };
        });
        setFormData(initialFormData);
      } else {
        setError(data.error || "Failed to fetch sections");
      }
    } catch {
      setError("Failed to fetch sections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sectionKey: string) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const sectionData = formData[sectionKey];
      const sectionConfig = authSections.find((s) => s.key === sectionKey);
      
      const response = await fetch("/api/admin/content/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: "auth",
          section_key: sectionKey,
          title_en: sectionData.title_en,
          title_ar: sectionData.title_ar,
          subtitle_en: sectionData.subtitle_en,
          subtitle_ar: sectionData.subtitle_ar,
          content_en: sectionData.content_en,
          content_ar: sectionData.content_ar,
          is_active: sectionData.is_active,
          display_order: authSections.findIndex((s) => s.key === sectionKey),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`${sectionConfig?.name || sectionKey} saved successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchSections();
      } else {
        setError(data.error || "Failed to save section");
      }
    } catch {
      setError("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (sectionKey: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LogIn className="w-6 h-6" />
            Auth Pages Content
          </h1>
          <p className="text-muted-foreground">
            Manage the text content displayed on login, signup, and authentication pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSections} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login" target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview Login
            </Link>
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
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

      {successMessage && (
        <Card className="border-emerald-500 bg-emerald-500/10">
          <CardContent className="flex items-center gap-2 py-3">
            <span className="text-sm text-emerald-600">{successMessage}</span>
          </CardContent>
        </Card>
      )}

      {/* Language Toggle */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as "en" | "ar")}>
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">Arabic (RTL)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Auth Page Sections</CardTitle>
          <CardDescription>
            Edit content for login, signup, and other authentication pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {authSections.map((section) => {
              const data = formData[section.key] || {
                title_en: "",
                title_ar: "",
                subtitle_en: "",
                subtitle_ar: "",
                content_en: "",
                content_ar: "",
                is_active: true,
              };
              const existingSection = sections.find((s) => s.section_key === section.key);

              return (
                <AccordionItem key={section.key} value={section.key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{section.name}</span>
                      {existingSection ? (
                        <Badge variant={existingSection.is_active ? "default" : "secondary"} className="text-xs">
                          {existingSection.is_active ? "Active" : "Inactive"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not configured
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {section.description}
                      </p>

                      {/* Title Field */}
                      <div className="space-y-2">
                        <Label>Title ({activeLanguage === "en" ? "English" : "Arabic"})</Label>
                        <Input
                          value={activeLanguage === "en" ? data.title_en : data.title_ar}
                          onChange={(e) =>
                            updateFormData(
                              section.key,
                              activeLanguage === "en" ? "title_en" : "title_ar",
                              e.target.value
                            )
                          }
                          placeholder={`Enter ${section.name.toLowerCase()} title`}
                          dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                        />
                      </div>

                      {/* Subtitle Field */}
                      <div className="space-y-2">
                        <Label>Subtitle ({activeLanguage === "en" ? "English" : "Arabic"})</Label>
                        <Textarea
                          value={activeLanguage === "en" ? data.subtitle_en : data.subtitle_ar}
                          onChange={(e) =>
                            updateFormData(
                              section.key,
                              activeLanguage === "en" ? "subtitle_en" : "subtitle_ar",
                              e.target.value
                            )
                          }
                          placeholder={`Enter ${section.name.toLowerCase()} subtitle or description`}
                          rows={2}
                          dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                        />
                      </div>

                      {/* Additional Content Field */}
                      <div className="space-y-2">
                        <Label>Additional Content ({activeLanguage === "en" ? "English" : "Arabic"})</Label>
                        <Textarea
                          value={activeLanguage === "en" ? data.content_en : data.content_ar}
                          onChange={(e) =>
                            updateFormData(
                              section.key,
                              activeLanguage === "en" ? "content_en" : "content_ar",
                              e.target.value
                            )
                          }
                          placeholder="Benefits list, button text, or additional content (one per line for lists)"
                          rows={4}
                          dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                        />
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <Label>Section Active</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable this content section
                          </p>
                        </div>
                        <Switch
                          checked={data.is_active}
                          onCheckedChange={(checked) =>
                            updateFormData(section.key, "is_active", checked)
                          }
                        />
                      </div>

                      {/* Save Button */}
                      <Button
                        onClick={() => handleSave(section.key)}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save {section.name}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
