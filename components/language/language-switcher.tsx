"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { persistLanguageClient, type SiteLanguage } from "@/lib/i18n/language";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ label: string; value: SiteLanguage; flag: string }> = [
  { label: "EN", value: "en", flag: "🇬🇧" },
  { label: "AR", value: "ar", flag: "🇲🇦" },
];

interface LanguageSwitcherProps {
  className?: string;
  withTheme?: boolean;
}

export function LanguageSwitcher({ className, withTheme = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const language = useSiteLanguage();

  const handleLanguageChange = (nextLanguage: SiteLanguage) => {
    if (nextLanguage === language) {
      return;
    }

    persistLanguageClient(nextLanguage);
    router.refresh();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-background/80 p-1 backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {withTheme ? (
        <>
          <ThemeToggle
            iconOnly
            variant="ghost"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
          />
          <span className="mx-1 h-4 w-px bg-border/80" aria-hidden />
        </>
      ) : null}
      <Languages className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={language === option.value ? "default" : "ghost"}
          className={cn(
            "h-7 px-2 text-xs gap-1",
            language === option.value ? "shadow-none" : "text-muted-foreground",
          )}
          onClick={() => handleLanguageChange(option.value)}
        >
          <span className="text-sm leading-none" aria-hidden="true">{option.flag}</span>
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
